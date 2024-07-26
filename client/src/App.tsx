import { AmpersandProvider, InstallIntegration } from "@amp-labs/react";

function App() {
  const options = {
    projectId: import.meta.env.VITE_AMPERSAND_PROJECT_ID as string, // Your Ampersand project ID.
    apiKey: import.meta.env.VITE_AMPERSAND_API_KEY as string, // Your Ampersand API key.
  };

  const myIntegrationName = "readListsAndContacts"
  const userId = "demoUserId"
  const userFullName = "Demo User"
  const teamId = "demoTeamId"
  const teamName = "Demo Team Name"

  return (
    <AmpersandProvider options={options}>
      <div
        style={{
          margin: "2rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <InstallIntegration
          integration={myIntegrationName}
          consumerRef={userId}
          consumerName={userFullName}
          groupRef={teamId}
          groupName={teamName}
          onInstallSuccess={(installationId, configObject) =>
            console.log(
              `Successfully installed ${installationId} with configuration ${JSON.stringify(
                configObject,
                null,
                2
              )}`
            )
          }
          onUpdateSuccess={(installationId, configObject) =>
            console.log(
              `Successfully updated ${installationId} with configuration ${JSON.stringify(
                configObject,
                null,
                2
              )}`
            )
          }
        />
      </div>
    </AmpersandProvider>
  );
}

export default App;
