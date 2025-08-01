# Signet DApp Security Interface
## Overview
The Signet DApp Security Interface provides a secure, permission-based system for DApps to access Profile data and communicate with other DApps running under the same Profile. This interface ensures that DApps can only access authorized information while maintaining strict security boundaries.
## Architecture
The security interface consists of several key components:
- **Security Service**: Manages DApp contexts, permissions, and inter-DApp communication
- **Security Context**: Isolated environment for each running DApp
- **Secure Interface**: API provided to DApps for accessing Profile data and services
- **Communication Channel**: Secure messaging system between DApps
- **Permission System**: Granular access control for sensitive operations

## Core Types
### DAppSecurityContext
Represents the security environment for a running DApp.
``` typescript
interface DAppSecurityContext {
  profileDid: string;           // Profile's DID
  walletAddress: string;        // Profile's wallet address
  permissions: DAppPermission[]; // Granted permissions
  sessionId: string;            // Unique session identifier
}
```
### DAppPermission
Defines what actions a DApp is allowed to perform.
``` typescript
interface DAppPermission {
  type: 'profile:read' | 'profile:write' | 'wallet:access' | 'dapp:communicate';
  granted: boolean;
  grantedAt: number;
}
```
### DAppMessage
Structure for inter-DApp communication.
``` typescript
interface DAppMessage {
  type: 'request' | 'response' | 'broadcast' | 'direct';
  from: string;      // Source DApp UUID
  to?: string;       // Target DApp UUID (for direct messages)
  payload: any;      // Message content
  timestamp: number; // Message timestamp
  signature?: string; // Optional message signature
}
```
## Secure Interface API
### Profile Access Methods
#### `getProfileDid(): Promise<string>`
Returns the Profile's DID (Decentralized Identifier).
**Required Permission**: `profile:read` (granted by default)
**Example**:
``` javascript
const did = await secureInterface.getProfileDid();
console.log('Profile DID:', did);
```
#### `getWalletAccess(): Promise<string>`
Returns the Profile's wallet public address.
**Required Permission**: `wallet:access`
**Example**:
``` javascript
try {
  const address = await secureInterface.getWalletAccess();
  console.log('Wallet Address:', address);
} catch (error) {
  console.error('Permission denied for wallet access');
}
```
### Communication Methods
#### `getCommunicationChannel(): DAppCommunicationChannel`
Returns a communication channel for inter-DApp messaging.
**Required Permission**: `dapp:communicate`
**Returns**: DAppCommunicationChannel object with methods:
##### `subscribe(callback: (message: DAppMessage) => void): () => void`
Subscribe to incoming messages from other DApps.
**Parameters**:
- `callback`: Function to handle incoming messages

**Returns**: Unsubscribe function
**Example**:
``` javascript
const channel = secureInterface.getCommunicationChannel();
const unsubscribe = channel.subscribe((message) => {
  console.log('Received message:', message);
});

// Later, to unsubscribe
unsubscribe();
```
##### `broadcast(payload: any): Promise<boolean>`
Send a message to all running DApps under the same Profile.
**Parameters**:
- `payload`: Data to broadcast

**Returns**: Success status
**Example**:
``` javascript
await channel.broadcast({
  type: 'status_update',
  data: { status: 'ready' }
});
```
##### `sendDirect(targetDApp: string, payload: any): Promise<boolean>`
Send a direct message to a specific DApp.
**Parameters**:
- `targetDApp`: UUID of the target DApp
- `payload`: Data to send

**Returns**: Success status
**Example**:
``` javascript
await channel.sendDirect('target-dapp-uuid', {
  action: 'share_data',
  data: myData
});
```
### Permission Management
#### `requestPermissions(permissions: string[]): Promise<DAppPermission[]>`
Request additional permissions from the user.
**Parameters**:
- `permissions`: Array of permission types to request

**Returns**: Array of permission results
**Example**:
``` javascript
const newPermissions = await secureInterface.requestPermissions([
  'wallet:access',
  'dapp:communicate'
]);

newPermissions.forEach(permission => {
  console.log(`${permission.type}: ${permission.granted ? 'Granted' : 'Denied'}`);
});
```
#### `getPermissions(): DAppPermission[]`
Get currently granted permissions.
**Returns**: Array of current permissions
**Example**:
``` javascript
const permissions = secureInterface.getPermissions();
const hasWalletAccess = permissions.some(p =>
  p.type === 'wallet:access' && p.granted
);
```
### Session Management
#### `getSessionId(): string`
Get the current session identifier.
**Returns**: Unique session ID
**Example**:
``` javascript
const sessionId = secureInterface.getSessionId();
console.log('Session ID:', sessionId);
```
#### `validateSession(): Promise<boolean>`
Validate that the current session is still active.
**Returns**: Session validity status
**Example**:
``` javascript
const isValid = await secureInterface.validateSession();
if (!isValid) {
  console.log('Session expired, requesting reconnection');
}
```
## Permission Types
### Default Permissions
- **`profile:read`**: Read access to basic profile information (granted by default)

### Requestable Permissions
- **`wallet:access`**: Access to the Profile's wallet address
- **`dapp:communicate`**: Ability to send and receive messages with other DApps
- **`profile:write`**: Write access to profile data (requires explicit user consent)

## DApp Development Guide
### Basic DApp Structure
Every DApp must export an function that receives the container element and secure interface: `init`
``` javascript
export async function init(container, secureInterface) {
  try {
    // Initialize your DApp here
    const did = await secureInterface.getProfileDid();

    // Create UI
    container.innerHTML = `
      <div>
        <h2>My DApp</h2>
        <p>Profile DID: ${did}</p>
      </div>
    `;

    // Set up event handlers, communication, etc.

  } catch (error) {
    console.error('DApp initialization failed:', error);
    // Handle error appropriately
  }
}
```

### DApp Types
Signet supports two types of DApps:

1. **Single-file DApps**: A single JavaScript file that exports an `init` function.
2. **Bundled DApps**: Multi-file applications (like React apps) that are bundled and expose an `init` function via a global variable.

For detailed information on creating bundled DApps, see [Bundled DApp Support](./Bundled%20DApp%20Support.md).
### Requesting Permissions
Always request permissions before attempting to access protected resources:
``` javascript
export async function init(container, secureInterface) {
  // Request necessary permissions
  await secureInterface.requestPermissions([
    'wallet:access',
    'dapp:communicate'
  ]);

  // Check if permissions were granted
  const permissions = secureInterface.getPermissions();
  const canAccessWallet = permissions.some(p =>
    p.type === 'wallet:access' && p.granted
  );

  if (canAccessWallet) {
    const walletAddress = await secureInterface.getWalletAccess();
    // Use wallet address
  }
}
```
### Inter-DApp Communication
Set up message handling for communication with other DApps:
``` javascript
export async function init(container, secureInterface) {
  const channel = secureInterface.getCommunicationChannel();

  // Subscribe to messages
  const unsubscribe = channel.subscribe((message) => {
    switch (message.type) {
      case 'broadcast':
        handleBroadcastMessage(message);
        break;
      case 'direct':
        handleDirectMessage(message);
        break;
    }
  });

  // Send a message
  await channel.broadcast({
    event: 'dapp_ready',
    timestamp: Date.now()
  });

  // Return cleanup function (optional)
  return () => {
    unsubscribe();
  };
}
```
### Error Handling
Always implement proper error handling for permission-related operations:
``` javascript
async function accessWallet(secureInterface) {
  try {
    const address = await secureInterface.getWalletAcess();
    return address;
  } catch (error) {
    if (error.message.includes('Permission denied')) {
      // Request permission
      await secureInterface.requestPermissions(['wallet:access']);
      // Retry
      return await secureInterface.getWalletAccess();
    }
    throw error;
  }
}
```
## Security Considerations
### Sandboxing
- Each DApp runs in its own security context
- DApps cannot access data from other DApps directly
- All inter-DApp communication goes through the secure messaging system

### Permission Model
- Permissions are granted per session
- Sensitive permissions require explicit user consent
- Permissions can be revoked at any time

### Data Privacy
- Profile DID and wallet address are only accessible with appropriate permissions
- Messages between DApps are not stored permanently
- Session data is cleaned up when DApps are closed

### Trust Boundaries
- DApps are considered untrusted code
- All access to Profile data is mediated by the security interface
- The Signet application maintains control over sensitive operations

## Integration Examples
### Simple Profile Display DApp
``` javascript
export async function init(container, secureInterface) {
  const did = await secureInterface.getProfileDid();

  container.innerHTML = `
    <div style="padding: 20px;">
      <h2>Profile Viewer</h2>
      <p><strong>DID:</strong> ${did}</p>
    </div>
  `;
}
```
### Wallet Integration DApp
``` javascript
export async function init(container, secureInterface) {
  // Request wallet access
  await secureInterface.requestPermissions(['wallet:access']);

  try {
    const walletAddress = await secureInterface.getWalletAccess();

    container.innerHTML = `
      <div style="padding: 20px;">
        <h2>Wallet Manager</h2>
        <p><strong>Address:</strong> ${walletAccess}</p>
        <button id="check-balance">Check Balance</button>
      </div>
    `;

    document.getElementById('check-balance').addEventListener('click', () => {
      // Implement balance checking logic
    });

  } catch (error) {
    container.innerHTML = `
      <div style="padding: 20px; color: red;">
        <h2>Access Denied</h2>
        <p>This DApp requires wallet access to function.</p>
      </div>
    `;
  }
}
```
### Communication Hub DApp
``` javascript
export async function init(container, secureInterface) {
  const channel = secureInterface.getCommunicationChannel();

  container.innerHTML = `
    <div style="padding: 20px;">
      <h2>DApp Communication Hub</h2>
      <div>
        <input type="text" id="message" placeholder="Enter message">
        <button id="broadcast">Broadcast</button>
      </div>
      <div id="messages" style="margin-top: 20px; height: 200px; overflow-y: auto;"></div>
    </div>
  `;

  const messagesDiv = document.getElementById('messages');

  // Subscribe to messages
  channel.subscribe((message) => {
    const messageEl = document.createElement('div');
    messageEl.innerHTML = `<strong>${message.from}:</strong> ${JSON.stringify(message.payload)}`;
    messagesDiv.appendChild(messageEl);
  });

  // Broadcast messages
  document.getElementById('broadcast').addEventListener('click', async () => {
    const messageText = document.getElementById('message').value;
    await channel.broadcast({ text: messageText });
    document.getElementById('message').value = '';
  });
}
```
## Best Practices
1. **Always request permissions before accessing protected resources**
2. **Implement proper error handling for permission-denied scenarios**
3. **Clean up resources and unsubscribe from channels when appropriate**
4. **Use meaningful message types for inter-DApp communication**
5. **Validate session status for long-running operations**
6. **Handle permission changes gracefully**
7. **Provide clear user feedback when permissions are required**

## Troubleshooting
### Common Issues
**Permission Denied Errors**
- Ensure you've requested the required permissions
- Check that permissions were actually granted by the user

**Communication Not Working**
- Verify that `dapp:communicate` permission is granted
- Check that target DApps are actually running

**Session Invalid**
- Sessions expire when DApps are closed
- Always validate session status for critical operations

**Missing Secure Interface**
- Ensure your DApp's function accepts the `secureInterface` parameter `init`
- Verify the DApp is being loaded through the Signet security system
