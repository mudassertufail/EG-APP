# EGApp pplication

This repository contains the code for the EGApp, an application composed of a .NET Web API backend and a Next.js frontend.

Project Structure
This project is divided into two main components:

# EGApp.Backend: An .NET Core Web API project.

# egapp.frontend: A Next.js frontend application.

# Setting Up EGApp.Backend (Web API)

This guide walks you through setting up and running the backend API, including its SQL Server database using Docker.

- Prerequisites
  Before you begin, ensure you have the following installed:

  # .NET SDK (version 9.0.0)

  # Docker Desktop

1.  Database Setup: SQL Server with Docker
    I use a Docker image for the SQL Server database.

    # Step 1: Pull the SQL Server Docker Image

         Open your terminal and download the latest SQL Server 2022 image:

         docker pull mcr.microsoft.com/mssql/server:2022-latest

    # Step 2: Run the SQL Server Container

         Start a new Docker container for your SQL Server instance. Remember to replace 'my_strong_password' with a strong, If the password is not strong enough, the container will fail to start.

         docker run -d --name egapp_sql_server -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=my_strong_password' -p 1433:1433 mcr.microsoft.com/mssql/server:2022-latest

         Also update the password in the ConnectionStrings in the appsettings.json file

2.  Backend Application Dependencies & Database Migration
    Navigate into the EGApp.Backend project directory in your terminal:

    cd EGApp.Backend

    # Step 3: Restore NuGet Packages

        Install all necessary NuGet packages for the project. This command also implicitly builds the project.

         dotnet restore

    # Step 4: Run Database Migrations

        Apply the database schema and seed initial data using Entity Framework Core migrations. This assumes you've configured AppDbContext with HasData.

        To ensure a clean start, first remove any old migration files and cached build .

        Clean up existing migration(not require for first time setup) files and cached builds

            rm -rf Migrations bin obj

    # Add a new initial migration (this creates the migration files based on your models)

             dotnet ef migrations add InitialDatabaseSetup

    # Apply all pending migrations to create the database and tables

            dotnet ef database update

    # Initial User Data:

        After running dotnet ef database update, the following default users will be created in the database (from AppDbContext seeding):

        Username:admin1 password:Admin@1234 Role:Admin

        Username:admin2 password:Admin@1234 Role:Admin

        Username:user1 password:Admin@1234 Role:User

        Username:user2 password:Admin@1234 Role:User

3.  Run the Backend API
    Once the database is set up and migrations are applied, you can run your API.

        dotnet run

    The backend API will start and be accessible primarily at http://localhost:5065
    Swagger UI for API testing will be available at http://localhost:5065/swagger

# Setting Up egapp.frontend (Next.js)

This guide walks you through setting up and running the Next.js frontend application.

# Prerequisites

    Before you begin, ensure you have the following installed:
        Node.js

1.  Install Node.js Dependencies
    Navigate into the egapp.frontend project directory in your terminal:

         cd egapp.frontend

         Then, install all the required Node.js packages:

         npm install

         # or

         yarn install

2.  Configure Environment Variables
    Create a .env.local file in the root of your egapp.frontend directory to configure the backend API URL. This variable will be accessible in your frontend code.

        egapp.frontend/.env.local

        NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:5065

3.  Run the Frontend Application
    Start the Next.js development server:

         npm run dev

         # or

         yarn dev

The frontend application will start and be accessible at http://localhost:3000
