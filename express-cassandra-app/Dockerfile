# Use the official Node.js image as a base
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to the container
COPY package*.json ./

# COPY init_keyspace.cql /docker-entrypoint-initdb.d/
# COPY init_keyspace.sh /docker-entrypoint-initdb.d/

# Install dependencies
RUN npm install
RUN npm install -g nodemon

# RUN chmod +x /docker-entrypoint-initdb.d/init_keyspace.sh

# ENTRYPOINT ["/docker-entrypoint-initdb.d/init_keyspace.sh"]

# Copy the rest of the application code to the container
COPY . .

# Expose the port that the app runs on
EXPOSE 3000

# Add this line before the CMD instruction

# Command to run the application
CMD ["npm", "run", "dev"]