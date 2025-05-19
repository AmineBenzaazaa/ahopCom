require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../model/schema/user');
const bcrypt = require('bcrypt');
const { initializeLeadSchema } = require("../model/schema/lead");
const { initializeContactSchema } = require("../model/schema/contact");
const { initializePropertySchema } = require("../model/schema/property");
const { createNewModule } = require("../controllers/customField/customField.js");
const customField = require('../model/schema/customField.js');
const { contactFields } = require('./contactFields.js');
const { leadFields } = require('./leadFields.js');
const { propertiesFields } = require('./propertiesFields.js');

const initializedSchemas = async () => {
  await initializeLeadSchema();
  await initializeContactSchema();
  await initializePropertySchema();

  const CustomFields = await customField.find({ deleted: false });
  const createDynamicSchemas = async (CustomFields) => {
    for (const module of CustomFields) {
      const { moduleName, fields } = module;

      if (!mongoose.models[moduleName]) {
        const schemaFields = {};
        for (const field of fields) {
          schemaFields[field.name] = { type: field.backendType };
        }
        const moduleSchema = new mongoose.Schema(schemaFields);
        mongoose.model(moduleName, moduleSchema, moduleName);
        console.log(`Schema created for module: ${moduleName}`);
      }
    }
  };

  createDynamicSchemas(CustomFields);
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
        dbName: process.env.DB,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
  

    console.log(`✅ MongoDB connected: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB}`);

    await initializedSchemas();

    const mockRes = {
      status: () => ({ json: () => {} }),
      json: () => {}
    };

    await createNewModule({ body: { moduleName: 'Leads', fields: leadFields, headings: [], isDefault: true } }, mockRes);
    await createNewModule({ body: { moduleName: 'Contacts', fields: contactFields, headings: [], isDefault: true } }, mockRes);
    await createNewModule({ body: { moduleName: 'Properties', fields: propertiesFields, headings: [], isDefault: true } }, mockRes);

    await initializedSchemas();

    let adminExisting = await User.find({ role: 'superAdmin' });
    if (adminExisting.length <= 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const user = new User({
        _id: new mongoose.Types.ObjectId('64d33173fd7ff3fa0924a109'),
        username: 'admin@gmail.com',
        password: hashedPassword,
        firstName: 'Prolink',
        lastName: 'Infotech',
        phoneNumber: 7874263694,
        role: 'superAdmin'
      });
      await user.save();
      console.log("Admin created successfully..");
    } else if (adminExisting[0].deleted === true) {
      await User.findByIdAndUpdate(adminExisting[0]._id, { deleted: false });
      console.log("Admin Update successfully..");
    } else if (adminExisting[0].username !== "admin@gmail.com") {
      await User.findByIdAndUpdate(adminExisting[0]._id, { username: 'admin@gmail.com' });
      console.log("Admin Update successfully..");
    }

    console.log("Database Connected Successfully..");
  } catch (err) {
    console.log("Database Not connected", err.message);
  }
};

module.exports = connectDB;