# Build stage - Node.js for React/Vite
FROM node:18 AS builder

WORKDIR /app

# Install git to allow repo cloning
RUN apt-get update && apt-get install -y git

# Clone your frontend repo (replace with your actual repository URL)
RUN git clone https://github.com/YOUR_USERNAME/news-aggregator-frontend.git .

# Install dependencies and build
RUN npm install
RUN npm run build

# Production stage - Lightweight Tomcat
FROM tomcat:10-jdk17

# Remove unnecessary files and default webapps to reduce size
RUN rm -rf /usr/local/tomcat/webapps/* \
    && rm -rf /usr/local/tomcat/temp/* \
    && rm -rf /usr/local/tomcat/work/* \
    && rm -rf /usr/local/tomcat/logs/* \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy only the built frontend files
COPY --from=builder /app/dist /usr/local/tomcat/webapps/ROOT

# Create non-root user for security
RUN groupadd -r tomcat && useradd -r -g tomcat tomcat \
    && chown -R tomcat:tomcat /usr/local/tomcat

USER tomcat

EXPOSE 8080

# Optimize JVM for container
ENV CATALINA_OPTS="-Xms128m -Xmx512m -XX:+UseG1GC -XX:+UseContainerSupport"

CMD ["catalina.sh", "run"]