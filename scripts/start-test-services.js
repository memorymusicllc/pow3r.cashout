/**
 * Test Services Startup Script
 * Starts backend and frontend services for E2E testing
 * 
 * @version 1.0.0
 * @date 2024-12-20
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKEND_PORT = 3001;
const FRONTEND_PORT = 5173;

class TestServicesManager {
  constructor() {
    this.processes = [];
    this.isShuttingDown = false;
  }

  async startBackend() {
    console.log('🚀 Starting backend server...');
    
    const backendProcess = spawn('node', ['backend/server.js'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PORT: BACKEND_PORT }
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend] ${data.toString().trim()}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend Error] ${data.toString().trim()}`);
    });

    backendProcess.on('close', (code) => {
      if (!this.isShuttingDown) {
        console.log(`Backend process exited with code ${code}`);
      }
    });

    this.processes.push(backendProcess);

    // Wait for backend to be ready
    await this.waitForService(`http://localhost:${BACKEND_PORT}/api/health`, 'Backend');
    return backendProcess;
  }

  async startFrontend() {
    console.log('🚀 Starting frontend server...');
    
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PORT: FRONTEND_PORT }
    });

    frontendProcess.stdout.on('data', (data) => {
      console.log(`[Frontend] ${data.toString().trim()}`);
    });

    frontendProcess.stderr.on('data', (data) => {
      console.error(`[Frontend Error] ${data.toString().trim()}`);
    });

    frontendProcess.on('close', (code) => {
      if (!this.isShuttingDown) {
        console.log(`Frontend process exited with code ${code}`);
      }
    });

    this.processes.push(frontendProcess);

    // Wait for frontend to be ready
    await this.waitForService(`http://localhost:${FRONTEND_PORT}`, 'Frontend');
    return frontendProcess;
  }

  async waitForService(url, serviceName, maxAttempts = 30) {
    console.log(`⏳ Waiting for ${serviceName} to be ready...`);
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          console.log(`✅ ${serviceName} is ready!`);
          return true;
        }
      } catch (error) {
        // Service not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`${serviceName} failed to start within ${maxAttempts} seconds`);
  }

  async startAll() {
    try {
      console.log('🎯 Starting test services...');
      
      // Start backend first
      await this.startBackend();
      
      // Start frontend
      await this.startFrontend();
      
      console.log('🎉 All services started successfully!');
      console.log(`📡 Backend: http://localhost:${BACKEND_PORT}`);
      console.log(`🌐 Frontend: http://localhost:${FRONTEND_PORT}`);
      
      // Keep the script running
      this.setupGracefulShutdown();
      
    } catch (error) {
      console.error('❌ Failed to start services:', error.message);
      await this.shutdown();
      process.exit(1);
    }
  }

  setupGracefulShutdown() {
    const shutdown = async () => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      
      console.log('\n🛑 Shutting down services...');
      await this.shutdown();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('exit', shutdown);
  }

  async shutdown() {
    console.log('🔄 Stopping all processes...');
    
    for (const process of this.processes) {
      if (process && !process.killed) {
        process.kill('SIGTERM');
        
        // Force kill after 5 seconds
        setTimeout(() => {
          if (!process.killed) {
            process.kill('SIGKILL');
          }
        }, 5000);
      }
    }
    
    this.processes = [];
    console.log('✅ All processes stopped');
  }
}

// Start services if this script is run directly
if (require.main === module) {
  const manager = new TestServicesManager();
  manager.startAll().catch(console.error);
}

module.exports = TestServicesManager;
