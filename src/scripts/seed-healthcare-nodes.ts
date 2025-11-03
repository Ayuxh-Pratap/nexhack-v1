/**
 * Script to seed initial healthcare specialist nodes
 * Run this script to populate the database with system nodes
 * 
 * Usage: npx ts-node src/scripts/seed-healthcare-nodes.ts
 */

// Load environment variables
import 'dotenv/config';

import { db } from "@/db";
import { node } from "@/db/schema";
import { prepareNodeSeedData } from "@/db/seed-nodes";
import { eq } from "drizzle-orm";

async function seedHealthcareNodes() {
  console.log("🏥 Starting healthcare nodes seeding...");
  
  try {
    const seedData = prepareNodeSeedData();
    let insertedCount = 0;
    let skippedCount = 0;

    for (const nodeData of seedData) {
      // Check if node already exists
      const existingNode = await db.query.node.findFirst({
        where: eq(node.id, nodeData.id),
      });

      if (existingNode) {
        console.log(`⏭️  Skipping ${nodeData.name} (already exists)`);
        skippedCount++;
        continue;
      }

      // Insert the node
      await db.insert(node).values(nodeData as any);
      console.log(`✅ Added ${nodeData.name} (${nodeData.specialty})`);
      insertedCount++;
    }

    console.log(`\n🎉 Seeding completed!`);
    console.log(`   📊 ${insertedCount} nodes inserted`);
    console.log(`   ⏭️  ${skippedCount} nodes skipped (already existed)`);
    console.log(`   📝 Total available nodes: ${insertedCount + skippedCount}`);
    
    // List all specialties
    const specialties = [...new Set(seedData.map(n => n.specialty))];
    console.log(`\n🔬 Available specialties:`);
    specialties.forEach(specialty => {
      const count = seedData.filter(n => n.specialty === specialty).length;
      console.log(`   - ${specialty}: ${count} node(s)`);
    });

  } catch (error) {
    console.error("❌ Error seeding healthcare nodes:", error);
    process.exit(1);
  }
}

async function listExistingNodes() {
  console.log("\n📋 Current nodes in database:");
  
  try {
    const existingNodes = await db.query.node.findMany({
      orderBy: (nodes, { asc }) => [asc(nodes.specialty), asc(nodes.name)],
    });

    if (existingNodes.length === 0) {
      console.log("   No nodes found in database.");
      return;
    }

    existingNodes.forEach(node => {
      const status = node.isActive ? "🟢" : "🔴";
      const type = node.isSystemNode ? "🏥" : "👤";
      console.log(`   ${status} ${type} ${node.name} (${node.specialty})`);
    });

    console.log(`\n   Total: ${existingNodes.length} nodes`);
    console.log(`   🟢 Active: ${existingNodes.filter(n => n.isActive).length}`);
    console.log(`   🔴 Inactive: ${existingNodes.filter(n => !n.isActive).length}`);
    console.log(`   🏥 System: ${existingNodes.filter(n => n.isSystemNode).length}`);
    console.log(`   👤 User-created: ${existingNodes.filter(n => !n.isSystemNode).length}`);

  } catch (error) {
    console.error("❌ Error listing existing nodes:", error);
  }
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'list':
      await listExistingNodes();
      break;
    case 'seed':
    default:
      await seedHealthcareNodes();
      await listExistingNodes();
      break;
  }

  process.exit(0);
}

// Run the script
if (require.main === module) {
  main();
}

export { seedHealthcareNodes, listExistingNodes };
