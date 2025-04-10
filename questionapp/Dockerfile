# Use the official Node.js image with a minimal Alpine Linux base to keep the image small
FROM node:alpine

# Set the working directory inside the container to /usr/src/app
# All subsequent commands will run inside this folder
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if it exists) into the container
# These files are used to install the app's dependencies
COPY ./package*.json .

# Run npm install to install all dependencies listed in package.json
RUN npm install

# Copy all remaining files from the host machine into the container
COPY . .

# Specify the command to run when the container starts:
# Start the app using Node.js and run the Question.js file
CMD ["node", "Question.js"]