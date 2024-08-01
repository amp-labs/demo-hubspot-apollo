# Demo-hubspot-apollo

This is a demo app to demonstrate the use of the Ampersand to build an integration use case involving Hubspot and Apollo. 

This project does the following: 

# Overview 

1. Read Lists of contacts from Hubspot & syncs those to the backend of the demo app. 
2. Reads from Apollo to understand which contacts have replied to messages / emails. 
3. Correlate the contact with the correct Contact in Hubspot via its ID
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




# Ampersand configuration 
The Ampersand configuration is defined in the `amp.yml` file located in the `amp` directory. This file specifies the integrations and their respective settings.

### Integrations

 1. Read Lists and Contacts from Hubspot `readListsAndContacts`
 2. Read Contacts from Apollo `readContacts`

The `amp.yml` file ensures that the specified integrations are configured to read data from Hubspot and Apollo at scheduled intervals and send the data to the designated webhooks.

