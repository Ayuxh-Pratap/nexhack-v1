# Node-Based Healthcare Chatbot System

## Overview

The Node-Based Healthcare Chatbot System allows users to create custom teams of medical specialists for comprehensive healthcare consultations. Each "node" represents a medical specialist with specific expertise, and multiple nodes can be combined to provide multidisciplinary medical advice.

## Backend Architecture

### Database Schema

#### New Tables Added

1. **`specialty` Enum**: Defines medical specialties (pediatrics, cardiology, infectious_disease, etc.)
2. **`node` Table**: Stores specialist information and prompts
3. **`chat_node` Table**: Many-to-many relationship between chats and active nodes

### API Endpoints

#### Node Management (`/trpc/node`)

- `getAvailableNodes`: Get all available specialist nodes
- `getNodesBySpecialty`: Get nodes filtered by medical specialties  
- `getNode`: Get detailed information about a specific node
- `createNode`: Create custom user-defined specialist nodes
- `updateNode`: Update existing user-created nodes
- `deleteNode`: Delete user-created nodes

#### Chat Node Management (`/trpc/chatNode`)

- `getActiveChatNodes`: Get active specialists for a specific chat
- `addNodeToChat`: Add a specialist to a chat session
- `removeNodeFromChat`: Remove a specialist from a chat session
- `updateNodePriority`: Change specialist priority order
- `addMultipleNodesToChat`: Bulk add multiple specialists

#### Enhanced AI Router (`/trpc/ai`)

The `generateResponse` endpoint now supports:
- **Node-based prompting**: Automatically merges active specialist prompts
- **Contextual responses**: Adapts responses based on user queries
- **Priority handling**: Respects specialist priority order
- **Backward compatibility**: Works with existing Velora mode and explicit prompts

### Prompt Merging System

The `node-prompt-merger.ts` utility intelligently combines multiple specialist prompts:

- **Single Node**: Enhanced individual specialist responses
- **Multiple Nodes**: Comprehensive multi-specialty team approach
- **Contextual Analysis**: Prioritizes most relevant specialists based on user queries
- **Priority System**: Respects specialist priority order (1 = highest priority)

## Usage Examples

### 1. Basic Node Management

```typescript
// Get all available nodes
const { nodes } = await trpc.node.getAvailableNodes.query();

// Get pediatric specialists
const { nodesBySpecialty } = await trpc.node.getNodesBySpecialty.query({
  specialties: ['pediatrics']
});

// Create a custom node
const { node } = await trpc.node.createNode.mutate({
  name: "Sports Medicine Specialist",
  description: "Expert in athletic injuries and performance medicine",
  specialty: "sports_medicine",
  prompt: "You are a sports medicine specialist focusing on..."
});
```

### 2. Chat Node Management

```typescript
// Add specialists to a chat
await trpc.chatNode.addNodeToChat.mutate({
  chatId: "chat_123",
  nodeId: "node_pediatrics_01",
  priority: 1 // Highest priority
});

await trpc.chatNode.addNodeToChat.mutate({
  chatId: "chat_123", 
  nodeId: "node_infectious_disease_01",
  priority: 2 // Secondary priority
});

// Get active specialists for a chat
const { activeNodes } = await trpc.chatNode.getActiveChatNodes.query({
  chatId: "chat_123"
});
```

### 3. AI Generation with Node-Based Prompting

```typescript
// Generate response with active specialists
const response = await trpc.ai.generateResponse.mutate({
  messages: [
    { role: 'user', content: 'My 5-year-old has a fever and rash after a dog bite' }
  ],
  config: {
    chatId: "chat_123", // Chat with Pediatric + Infectious Disease specialists
    useNodeBasedPrompting: true
  }
});

console.log(response.metadata);
// {
//   systemPromptSource: 'nodes',
//   activeNodes: [
//     { id: 'node_pediatrics_01', name: 'Pediatric Specialist', specialty: 'pediatrics', priority: 1 },
//     { id: 'node_infectious_disease_01', name: 'Infectious Disease Specialist', specialty: 'infectious_disease', priority: 2 }
//   ],
//   totalActiveNodes: 2
// }
```

## System Prompt Priority Order

The system determines which prompt to use based on this priority:

1. **Explicit systemPrompt** (config.systemPrompt) - Highest priority
2. **Velora Mode** (config.useVeloraMode = true) 
3. **Node-based prompting** (active specialists in chat)
4. **Default AI manager prompt** - Fallback

## Pre-built Healthcare Specialists

The system comes with 10 pre-built specialist nodes:

1. **General Medicine Specialist** - Primary care and internal medicine
2. **Pediatric Specialist** - Child and adolescent health (0-18 years)
3. **Infectious Disease Specialist** - Bacterial, viral, fungal infections
4. **Emergency Medicine Specialist** - Acute care and trauma
5. **Cardiologist** - Heart and cardiovascular conditions
6. **Neurologist** - Brain, spinal cord, and nervous system
7. **Psychiatrist** - Mental health and psychiatric disorders
8. **Dermatologist** - Skin, hair, and nail conditions
9. **Orthopedic Specialist** - Musculoskeletal system disorders
10. **Gastroenterologist** - Digestive system and liver diseases
11. **Rabies Specialist** - Rabies prevention and post-exposure care

## Database Seeding

To populate the database with initial healthcare specialists:

```bash
# Seed the database
npx ts-node src/scripts/seed-healthcare-nodes.ts seed

# List existing nodes  
npx ts-node src/scripts/seed-healthcare-nodes.ts list
```

## Integration with Existing Chat System

The node system integrates seamlessly with your existing chat infrastructure:

- **Chat Messages**: Work exactly as before
- **User Authentication**: Uses existing protected procedures
- **Velora Mode**: Still available and takes priority over nodes
- **Study Mode**: Can be combined with specialist nodes

## Error Handling

The system includes comprehensive error handling:

- **Chat Ownership Verification**: Ensures users can only modify their own chats
- **Node Access Control**: Users can only access system nodes + their own custom nodes
- **Graceful Degradation**: Falls back to default prompts if node processing fails
- **Validation**: Comprehensive input validation for all endpoints

## Performance Considerations

- **Prompt Caching**: Frequently used node combinations can be cached
- **Token Optimization**: System automatically adjusts maxTokens based on prompt complexity
- **Database Optimization**: Efficient queries with proper indexing on foreign keys
- **Lazy Loading**: Nodes are only loaded when needed for active chats

## Future Enhancements

The system is designed to be extensible:

- **RAG Integration**: Could add vector database for specialist knowledge
- **Dynamic Node Creation**: AI-powered generation of custom specialists
- **Node Relationships**: Define how specialists interact with each other
- **Specialist Confidence**: Nodes could indicate confidence levels
- **Learning System**: Nodes could learn from user interactions

## Testing the Implementation

You can test the backend implementation immediately:

1. **Run Database Migration** (if using migration system)
2. **Seed Healthcare Nodes**: Run the seeding script
3. **Test Node API**: Use tRPC client to test node endpoints
4. **Test Chat Integration**: Create a chat and add specialists
5. **Test AI Generation**: Generate responses with active specialists

The backend is now fully functional and ready for frontend integration!
