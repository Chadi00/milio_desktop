# Milio Desktop: An AI-Powered Desktop Assistant

## Overview
Milio Desktop is an Electron-based application that transforms your interaction with your computer through an AI-powered chat interface. Built primarily in JavaScript with HTML and CSS, this app leverages a sophisticated backend server to process user commands and perform a variety of tasks directly from your desktop.
This desktop application is intended to work by calling this server : https://github.com/Chadi00/milio_server/

## Key Features
**User Authentication**
Login/Signup: Secure user authentication allows users to access personalized functionalities and ensure security.
**AI-Powered Chatbot**
Dynamic Command Processing: When a user types a command like "open discord", the app communicates with the backend server, which processes the input and returns an action code.
Script-Driven Actions: The app contains scripts that react to specific action codes to perform tasks such as opening applications, playing music, restarting the computer, taking screenshots, sending emails, recording with the webcam, and more.
Interactive Conversations: Aside from performing tasks, the chatbot can engage in general conversations, providing explanations or chatting casually with the user.

## How It Works
**User Input**: Within the chat interface, the user submits a command or query.
**Server Communication**: The app sends a POST request to the /chat endpoint of the server with the user's message.
**Action Code Reception**: The server analyzes the message using advanced AI models and returns an action code corresponding to the specific task.
**Task Execution**: Depending on the received action code, the appropriate script is triggered to execute the task on the user's desktop.

## Technology Stack
**Electron**: Provides a robust framework for creating desktop applications using web technologies.
**JavaScript, HTML, CSS**: Core technologies used for building the application's frontend and handling UI/UX aspects.
**Node.js**: Facilitates backend integration and script management within the application environment.
