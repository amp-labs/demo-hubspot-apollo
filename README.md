<br/>
<div align="center">
    <a href="https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=docs-starter-openapi&utm_content=logo">
    <img src="https://res.cloudinary.com/dycvts6vp/image/upload/v1723671980/ampersand-logo-black_fwzpfw.svg" height="30" align="center" alt="Ampersand logo" >
    </a>
<br/>
<br/>

<div align="center">

[![Star us on GitHub](https://img.shields.io/github/stars/amp-labs/connectors?color=FFD700&label=Stars&logo=Github)](https://github.com/amp-labs/connectors) [![Discord](https://img.shields.io/badge/Join%20The%20Community-black?logo=discord)](https://discord.gg/BWP4BpKHvf) [![Documentation](https://img.shields.io/badge/Read%20our%20Documentation-black?logo=book)](https://docs.withampersand.com) ![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) <img src="https://img.shields.io/static/v1?label=license&message=MIT&color=white" alt="License">
</div>

</div>

# Ampersand demo app for Hubspot and Apollo integration

This is a demo app to demonstrate the use of the Ampersand to build an integration use case involving Hubspot and Apollo. 

# Overview 

The app does the following: 
1. Read Lists of contacts from Hubspot & syncs those to the backend of the demo app. 
2. Reads from Apollo to understand which contacts have replied to messages / emails. 
3. Correlate the contact with the correct Contact in Hubspot via its email.
4. Writes to the custom field of that contact with "true" if the contact replied to the message on HubSpot. 

# Client

To run the client, follow these steps:

1. Navigate to the `client` directory:
   ```sh
   cd demo-hubspot-apollo/client
   ```

2. Install the dependencies:
   ```sh
   yarn install
   ```

3. Add a `.env` with your ampersand credentials and project id similar to `.env.example` 

    ```sh
    cp client/.env.example client/.env
    ```

    Update the `.env` file with your credentials.
    ```
    VITE_AMPERSAND_PROJECT_ID=<YOUR_AMPERSAND_PROJECT_ID>
    VITE_AMPERSAND_API_KEY=<YOUR_AMPERSAND_API_KEY>
    ```

4. Start the development server:
   ```sh
   yarn run dev
   ```

4. Open your browser and go to `http://localhost:3000` to see the application in action.


# Server 

To run the server, follow these steps:

1. Navigate to the `server` directory:
   ```sh
   cd demo-hubspot-apollo/server
   ```

2. Install the dependencies:
   ```sh
   pnpm install
   ```

3. Add a `.env` file with your Ampersand API key similar to `.env.example`:
   ```sh
   cp .env.example .env
   ```

   Update the `.env` file with your API key:
   ```
   AMP_API_KEY=<YOUR_API_KEY>
   ```

4. Start the server:
   ```sh
   pnpm start
   ```

5. The server will be running on `http://localhost:4001`.

6. When developing locally, connect `localhost` to a public domain so that Ampersand can write to the destinations specificed in the server. 

    ```sh

    ngrok http --domain=<YOUR_STATIC_DOMAIN_URL> 4001 
    
    # or use the dynamic https URL generated below in webhook URL under destinations in the Ampersand dashboard

    ngrok http 4001
    
    ```

> Note: when deploying this integration to a hosted environment ensure destinations are configured to point to the hosted URL of the `server`.



# Ampersand configuration 
The Ampersand configuration is defined in the `amp.yml` file located in the `amp` directory. This file specifies the integrations and their respective settings.

### Integrations

 1. Read Lists and Contacts from Hubspot `readListsAndContacts`
 2. Read Contacts from Apollo `readContacts`

The `amp.yml` file ensures that the specified integrations are configured to read data from Hubspot and Apollo at scheduled intervals and send the data to the designated webhooks.


### Ensure the amp configuration is deployed 

```sh

amp deploy ./amp --project <YOUR_AMPERSAND_PROJECTID>

```

