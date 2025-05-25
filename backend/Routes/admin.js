const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { exec } = require('child_process');
const path = require('path');

// Create admin route
router.post('/create', async (req, res) => {
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({});
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin already exists'
            });
        }

        // Execute the createAdmin script
        const scriptPath = path.join(__dirname, '../scripts/createAdmin.js');
        exec(`node ${scriptPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing script: ${error}`);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create admin',
                    error: error.message
                });
            }

            if (stderr) {
                console.error(`Script stderr: ${stderr}`);
            }

            console.log(`Script output: ${stdout}`);
            res.status(201).json({
                success: true,
                message: 'Admin created successfully',
                output: stdout
            });
        });
    } catch (error) {
        console.error('Error in create admin route:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router; 