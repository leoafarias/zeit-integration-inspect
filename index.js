const { htm } = require("@zeit/integration-utils");

module.exports = async function inspectPanel(options, values) {
  if (options === null || typeof options !== "object") {
    console.error("Options need to be a valid object.");
  }

  if (!options.metadata || !options.payload) {
    console.error("Inspector needs to receive valid options");
  }

  let { payload, metadata, zeitClient } = options;
  let { action, clientState } = payload;

  // Check if there is no values
  const defaults = {
    clientState: clientState,
    metadata: metadata,
    action: action
  };

  // Add default values to values parameter
  values = { ...values, ...defaults };

  // Gets keys of all the values
  const keys = Object.keys(values);

  // If gets saved values or sets empty object
  let inspectorValues = metadata.inspectorValues || {};

  // If a key does not exist, create with default to show
  keys.forEach(k => {
    if (!inspectorValues[k]) {
      inspectorValues[k] = "SHOW";
    }
  });

  if (action === "hide-inspector") {
    metadata["showInspector"] = false;
  }

  if (action === "show-inspector") {
    metadata["showInspector"] = true;
  }

  if (action === "refresh-inspector") {
    // Checks values and updates metadata
    keys.forEach(k => {
      inspectorValues[k] = clientState["inspect-" + k] ? "SHOW" : "HIDE";
    });
  }

  metadata.inspectorValues = inspectorValues;

  if (action === "clear-metadata-inspector") {
    metadata = {};
  }

  // Sets sets updated values to metadata
  await zeitClient.setMetadata(metadata);

  // Check if it should display inspector, and sets css property
  const shouldDisplay = metadata.showInspector ? "visible" : "hidden";

  // Render inspector button to show and hide based on showInspector
  const renderDisplayButton = metadata.showInspector
    ? htm`<Button small action="hide-inspector">Hide</Button>`
    : htm`<Button small action="show-inspector">Show Inspector</Button>`;

  // Options to toggle the display of the panels
  const renderDisplayOptions = keys => {
    return keys.map(k => {
      return htm`
            <Box margin-left="20px">
                <Checkbox name="${"inspect-" + k}" label="${k}" checked="${inspectorValues[k] === "SHOW"}"  />
            </Box>
            `;
    });
  };

  // renders the panels for each value to inspect
  const renderPanels = keys => {
    return keys.map(k => {
      // Loop through all the value that are set to show to create the panels
      if (inspectorValues[k] === "SHOW") {
        return htm`
            <Box width="100%" overflow="auto" border="1px solid #222">
                <Box position="absolute" height="40px" padding="10px" background-color="rgb(37, 37, 37)">${k}</Box>
                <Box white-space="pre" font-size="14px" margin-top="40px" line-height="24px" padding="20px" font-family="monospace, serif">
                    ${JSON.stringify(values[k], null, 2)}
                </Box>
            </Box>`;
      } else {
        // If value is not set to show, create empty box
        return htm`<Box/>`;
      }
    });
  };

  return htm`
        <Box visibility="${shouldDisplay}" display="flex" width="100%" z-index="998" right="0" left="0" max-height="500px"  position="fixed" bottom="40px" width="100%" color="#fff" background-color="#010101"> 
            ${renderPanels(keys)}
        </Box>
        <Box border-top="1px solid #555" position="fixed" z-index="999" width="100%" left="0" right="0" height="45px" bottom="0" padding="10px" background-color="#333">
            <Box display="flex" align-items="center" color="#fff">  
                ${renderDisplayButton}
            <Box margin-left="10px">
                <Button small abort action="clear-metadata-inspector">Clear Metadata</Button>     
            </Box>
            ${renderDisplayOptions(keys)}
            <Box margin-left="10px">
                <Button small action="refresh-inspector">Update display</Button>     
            </Box>
            </Box>
        </Box>
        `;
};
