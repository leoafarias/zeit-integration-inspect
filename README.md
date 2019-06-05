# zeit-integration-inspect

Quickly inspect values during Zeit Integrations development.

![Screenshot](./screen.png)

## Install

```bash
yarn add --dev zeit-integration-inspect
```

## Usage

```javascript
const inspectPanel = require("zeit-integration-inspect");

async function handler(options){
    return htm`
        <Page>
            <Container>
                <H2>Your Integration</H2>
                <P>Awesome description.</P>
            </Container>
            ${await inspectPanel(options, values)}
        </Page>
    `;
}

module.exports = withUiHook(handler);
```

### Parameters

- **options** - values that are passed down from withUiHook middleware.

- **values** - These are values you would like to display during development.

### Default Panels

The panel will display **metadata, clientState, action** by default from the **options** parameter.

You can always choose to hide them.
