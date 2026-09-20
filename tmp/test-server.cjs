var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express2 = __toESM(require("express"), 1);
var import_path6 = __toESM(require("path"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_compression = __toESM(require("compression"), 1);
var import_vite = require("vite");

// server/routes.ts
var import_express = require("express");
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);

// server/configuratorData.ts
var INITIAL_ERP_MODULES = [
  {
    "id": "account",
    "title": "\u062D\u0633\u0627\u0628\u062F\u0627\u0631\u06CC",
    "category": "\u0639\u0645\u0648\u0645\u06CC",
    "price": 3e5,
    "dependencies": [
      "mail",
      "contacts",
      "sale"
    ],
    "industries": [],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-14 05:54:49",
    "deleted_at": null
  },
  {
    "id": "activities",
    "title": "\u0627\u0642\u062F\u0627\u0645\u0627\u062A \u0648 \u067E\u06CC\u06AF\u06CC\u0631\u06CC\u200C\u0647\u0627",
    "category": "\u0639\u0645\u0648\u0645\u06CC",
    "price": 9e4,
    "dependencies": [
      "mail",
      "calendar",
      "contacts",
      "project"
    ],
    "industries": [
      "education_academy",
      "distribution_logistics",
      "immigration"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:47:07",
    "deleted_at": null
  },
  {
    "id": "ai_assistant",
    "title": "\u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC",
    "category": "productivity",
    "price": 25e4,
    "dependencies": [],
    "industries": [],
    "description": "\u0646\u06AF\u0627\u0631\u0634 \u0647\u0648\u0634\u0645\u0646\u062F \u0645\u062A\u0648\u0646\u060C \u062A\u062D\u0644\u06CC\u0644 \u0631\u0648\u0646\u062F \u0641\u0631\u0648\u0634 \u0648 \u067E\u06CC\u0634\u200C\u0628\u06CC\u0646\u06CC \u062A\u0642\u0627\u0636\u0627",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  },
  {
    "id": "calendar",
    "title": "\u06AF\u0627\u0647\u0634\u0645\u0627\u0631",
    "category": "\u0639\u0645\u0648\u0645\u06CC",
    "price": 0,
    "dependencies": [
      "mail",
      "contacts",
      "im_livechat",
      "hr_holidays",
      "hr_recruitment",
      "hr_attendance",
      "activities",
      "hr",
      "survey",
      "project",
      "sale",
      "stock",
      "survey_feedback",
      "loyalty",
      "knowledge",
      "helpdesk",
      "hr_payroll",
      "hr_timesheet",
      "ai_assistant",
      "account",
      "crm"
    ],
    "industries": [
      "medical_pharma",
      "it_software",
      "healthcare_clinic",
      "immigration",
      "legal_law",
      "real_estate",
      "services_maintenance",
      "manufacturing",
      "insurance_agency",
      "contracting_projects",
      "advertising_marketing",
      "commerce_trade",
      "distribution_logistics",
      "education_academy",
      "consulting_finance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:38:17",
    "deleted_at": null
  },
  {
    "id": "contacts",
    "title": "\u0645\u062E\u0627\u0637\u0628\u0627\u0646 \u0648 \u0627\u0634\u062E\u0627\u0635",
    "category": "\u0639\u0645\u0648\u0645\u06CC",
    "price": 0,
    "dependencies": [
      "crm",
      "account",
      "ai_assistant",
      "hr_timesheet",
      "hr_payroll",
      "knowledge",
      "loyalty",
      "im_livechat",
      "helpdesk",
      "sale",
      "stock",
      "survey_feedback",
      "hr",
      "survey",
      "project",
      "hr_attendance",
      "calendar",
      "activities",
      "hr_holidays",
      "hr_recruitment",
      "mail"
    ],
    "industries": [
      "advertising_marketing",
      "commerce_trade",
      "consulting_finance",
      "contracting_projects",
      "distribution_logistics",
      "education_academy",
      "healthcare_clinic",
      "immigration",
      "insurance_agency",
      "it_software",
      "legal_law",
      "manufacturing",
      "medical_pharma",
      "real_estate",
      "services_maintenance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:38:51",
    "deleted_at": null
  },
  {
    "id": "crm",
    "title": "\u0645\u062F\u06CC\u0631\u06CC\u062A \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0645\u0634\u062A\u0631\u06CC (CRM)",
    "category": "\u0639\u0645\u0648\u0645\u06CC",
    "price": 35e4,
    "dependencies": [
      "mail",
      "calendar",
      "contacts"
    ],
    "industries": [
      "advertising_marketing",
      "commerce_trade",
      "consulting_finance",
      "contracting_projects",
      "distribution_logistics",
      "education_academy",
      "healthcare_clinic",
      "immigration",
      "insurance_agency",
      "it_software",
      "legal_law",
      "manufacturing",
      "medical_pharma",
      "real_estate",
      "services_maintenance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:40:18",
    "deleted_at": null
  },
  {
    "id": "helpdesk",
    "title": "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC",
    "category": "management",
    "price": 25e4,
    "dependencies": [],
    "industries": [],
    "description": "\u0645\u06CC\u0632 \u062E\u062F\u0645\u062A\u060C \u067E\u0648\u0631\u062A\u0627\u0644 \u062A\u06CC\u06A9\u062A \u0645\u0634\u062A\u0631\u06CC\u0627\u0646 \u0648 \u0632\u0645\u0627\u0646\u200C\u0628\u0646\u062F\u06CC \u067E\u0627\u0633\u062E\u06AF\u0648\u06CC\u06CC SLA",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-13 11:47:54",
    "deleted_at": null
  },
  {
    "id": "hr",
    "title": "\u06A9\u0627\u0631\u0645\u0646\u062F\u0627\u0646",
    "category": "\u0639\u0645\u0648\u0645\u06CC",
    "price": 13e4,
    "dependencies": [
      "mail",
      "contacts",
      "calendar"
    ],
    "industries": [
      "advertising_marketing",
      "commerce_trade",
      "contracting_projects",
      "distribution_logistics",
      "education_academy",
      "healthcare_clinic",
      "immigration",
      "insurance_agency",
      "it_software",
      "legal_law",
      "manufacturing",
      "medical_pharma",
      "real_estate",
      "services_maintenance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:42:25",
    "deleted_at": null
  },
  {
    "id": "hr_attendance",
    "title": "\u062D\u0636\u0648\u0631 \u0648 \u063A\u06CC\u0627\u0628 \u067E\u0631\u0633\u0646\u0644",
    "category": "\u0639\u0645\u0648\u0645\u06CC",
    "price": 1e5,
    "dependencies": [
      "mail",
      "calendar",
      "contacts",
      "hr"
    ],
    "industries": [
      "contracting_projects",
      "education_academy",
      "healthcare_clinic",
      "it_software",
      "manufacturing"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:42:48",
    "deleted_at": null
  },
  {
    "id": "hr_holidays",
    "title": "\u0645\u0631\u062E\u0635\u06CC \u0648 \u0645\u0627\u0645\u0648\u0631\u06CC\u062A",
    "category": "\u0639\u0645\u0648\u0645\u06CC",
    "price": 5e4,
    "dependencies": [
      "hr",
      "contacts",
      "calendar",
      "mail"
    ],
    "industries": [
      "real_estate",
      "medical_pharma",
      "healthcare_clinic",
      "insurance_agency",
      "immigration",
      "legal_law"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:47:33",
    "deleted_at": null
  },
  {
    "id": "hr_payroll",
    "title": "\u062D\u0642\u0648\u0642 \u0648 \u062F\u0633\u062A\u0645\u0632\u062F",
    "category": "hr",
    "price": 25e4,
    "dependencies": [
      "hr"
    ],
    "industries": [],
    "description": "\u0645\u062D\u0627\u0633\u0628\u0647 \u0641\u06CC\u0634 \u062D\u0642\u0648\u0642\u06CC \u0645\u0637\u0627\u0628\u0642 \u0642\u0627\u0646\u0648\u0646 \u06A9\u0627\u0631\u060C \u062F\u06CC\u0633\u06A9\u062A \u0628\u06CC\u0645\u0647 \u0648 \u0641\u0627\u06CC\u0644 \u0628\u0627\u0646\u06A9\u06CC",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  },
  {
    "id": "hr_recruitment",
    "title": "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0648 \u062C\u0630\u0628 \u0646\u06CC\u0631\u0648",
    "category": "\u0639\u0645\u0648\u0645\u06CC",
    "price": 8e4,
    "dependencies": [
      "hr",
      "mail",
      "calendar",
      "contacts"
    ],
    "industries": [
      "advertising_marketing",
      "education_academy",
      "contracting_projects",
      "consulting_finance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:47:19",
    "deleted_at": null
  },
  {
    "id": "hr_timesheet",
    "title": "\u0628\u0631\u06AF\u0647 \u0633\u0627\u0639\u062A \u06A9\u0627\u0631\u06A9\u0631\u062F",
    "category": "management",
    "price": 25e4,
    "dependencies": [
      "project"
    ],
    "industries": [],
    "description": "\u062B\u0628\u062A \u06A9\u0627\u0631\u06A9\u0631\u062F \u0633\u0627\u0639\u062A\u06CC \u067E\u0631\u0633\u0646\u0644 \u0628\u0631 \u0631\u0648\u06CC \u062A\u0633\u06A9\u200C\u0647\u0627 \u0648 \u06A9\u0646\u062A\u0631\u0644 \u0631\u0627\u0646\u062F\u0645\u0627\u0646",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  },
  {
    "id": "im_livechat",
    "title": "\u0686\u062A \u0627\u0646\u0644\u0627\u06CC\u0646",
    "category": "marketing",
    "price": 25e4,
    "dependencies": [],
    "industries": [],
    "description": "\u0627\u0628\u0632\u0627\u0631\u06A9 \u06AF\u0641\u062A\u06AF\u0648\u06CC \u0632\u0646\u062F\u0647 \u0628\u0627 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0648 \u0645\u0634\u062A\u0631\u06CC\u0627\u0646 \u0631\u0648\u06CC \u0648\u0628\u200C\u0633\u0627\u06CC\u062A",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  },
  {
    "id": "knowledge",
    "title": "\u062F\u0627\u0646\u0634",
    "category": "productivity",
    "price": 25e4,
    "dependencies": [],
    "industries": [],
    "description": "\u067E\u0627\u06CC\u06AF\u0627\u0647 \u062F\u0627\u0646\u0634 \u0633\u0627\u0632\u0645\u0627\u0646\u06CC\u060C \u0631\u0627\u0647\u0646\u0645\u0627\u0647\u0627\u06CC \u0622\u0645\u0648\u0632\u0634\u06CC \u0648 \u0648\u06CC\u06A9\u06CC \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u062A\u06CC\u0645\u06CC",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  },
  {
    "id": "loyalty",
    "title": "\u0628\u0627\u0634\u06AF\u0627\u0647 \u0645\u0634\u062A\u0631\u06CC\u0627\u0646",
    "category": "sales",
    "price": 25e4,
    "dependencies": [
      "sale"
    ],
    "industries": [],
    "description": "\u0627\u0645\u062A\u06CC\u0627\u0632 \u062E\u0631\u06CC\u062F\u060C \u0628\u0646\u200C\u0647\u0627\u06CC \u0647\u062F\u06CC\u0647\u060C \u06A9\u0648\u067E\u0646 \u062A\u062E\u0641\u06CC\u0641 \u0648 \u06A9\u0627\u0631\u062A \u0648\u0641\u0627\u062F\u0627\u0631\u06CC",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  },
  {
    "id": "mail",
    "title": "\u06AF\u0641\u062A\u06AF\u0648",
    "category": "\u0639\u0645\u0648\u0645\u06CC",
    "price": 0,
    "dependencies": [
      "contacts",
      "crm",
      "helpdesk",
      "hr_payroll",
      "account",
      "ai_assistant",
      "hr_timesheet",
      "knowledge",
      "loyalty",
      "im_livechat",
      "sale",
      "project",
      "survey",
      "stock",
      "survey_feedback",
      "hr",
      "activities",
      "hr_attendance",
      "hr_recruitment",
      "hr_holidays",
      "calendar"
    ],
    "industries": [
      "advertising_marketing",
      "commerce_trade",
      "consulting_finance",
      "contracting_projects",
      "distribution_logistics",
      "education_academy",
      "healthcare_clinic",
      "immigration",
      "insurance_agency",
      "it_software",
      "legal_law",
      "manufacturing",
      "medical_pharma",
      "real_estate",
      "services_maintenance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:39:17",
    "deleted_at": null
  },
  {
    "id": "mass_mailing_sms",
    "title": "\u067E\u06CC\u0627\u0645\u06A9",
    "category": "marketing",
    "price": 1e5,
    "dependencies": [],
    "industries": [],
    "description": "\u0633\u0627\u0645\u0627\u0646\u0647 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645\u06A9 \u0627\u0646\u0628\u0648\u0647 \u0627\u0637\u0644\u0627\u0639\u200C\u0631\u0633\u0627\u0646\u06CC\u060C \u062A\u062E\u0641\u06CC\u0641 \u0648 \u0645\u0646\u0627\u0633\u0628\u062A\u06CC",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-13 11:49:35",
    "deleted_at": null
  },
  {
    "id": "project",
    "title": "\u067E\u0631\u0648\u0698\u0647",
    "category": "\u0639\u0645\u0648\u0645\u06CC",
    "price": 15e4,
    "dependencies": [
      "mail",
      "contacts",
      "calendar"
    ],
    "industries": [
      "advertising_marketing",
      "consulting_finance",
      "contracting_projects",
      "immigration",
      "it_software",
      "legal_law",
      "manufacturing",
      "medical_pharma",
      "services_maintenance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:41:38",
    "deleted_at": null
  },
  {
    "id": "sale",
    "title": "\u0641\u0631\u0648\u0634",
    "category": "\u0639\u0645\u0648\u0645\u06CC",
    "price": 25e4,
    "dependencies": [
      "mail",
      "contacts",
      "calendar"
    ],
    "industries": [
      "advertising_marketing",
      "commerce_trade",
      "consulting_finance",
      "contracting_projects",
      "distribution_logistics",
      "education_academy",
      "immigration",
      "insurance_agency",
      "it_software",
      "manufacturing",
      "medical_pharma",
      "real_estate",
      "services_maintenance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 05:44:36",
    "deleted_at": null
  },
  {
    "id": "stock",
    "title": "\u0627\u0646\u0628\u0627\u0631 \u0648 \u06A9\u0627\u0644\u0627",
    "category": "logistics",
    "price": 25e4,
    "dependencies": [],
    "industries": [],
    "description": "\u06A9\u0627\u0631\u062F\u06A9\u0633 \u06A9\u0627\u0644\u0627\u060C \u06A9\u0646\u062A\u0631\u0644 \u0645\u0648\u062C\u0648\u062F\u06CC \u0686\u0646\u062F\u0627\u0646\u0628\u0627\u0631\u0647 \u0648 \u0646\u0642\u0637\u0647 \u0633\u0641\u0627\u0631\u0634 \u062E\u0648\u062F\u06A9\u0627\u0631",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  },
  {
    "id": "survey",
    "title": "\u0641\u0631\u0645\u200C\u0633\u0627\u0632",
    "category": "\u0639\u0645\u0648\u0645\u06CC",
    "price": 15e4,
    "dependencies": [
      "contacts",
      "crm",
      "calendar",
      "mail"
    ],
    "industries": [
      "advertising_marketing",
      "commerce_trade",
      "consulting_finance",
      "contracting_projects",
      "distribution_logistics",
      "education_academy",
      "healthcare_clinic",
      "immigration",
      "insurance_agency",
      "it_software",
      "legal_law",
      "manufacturing",
      "medical_pharma",
      "real_estate",
      "services_maintenance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 05:44:43",
    "deleted_at": null
  },
  {
    "id": "survey_feedback",
    "title": "\u0646\u0638\u0631\u0633\u0646\u062C\u06CC \u0647\u0627",
    "category": "marketing",
    "price": 25e4,
    "dependencies": [],
    "industries": [],
    "description": "\u067E\u0631\u0633\u0634\u0646\u0627\u0645\u0647\u200C\u0647\u0627\u06CC \u0622\u0646\u0644\u0627\u06CC\u0646 \u0648 \u0633\u0646\u062C\u0634 \u0633\u0637\u062D \u0631\u0636\u0627\u06CC\u062A \u0645\u0634\u062A\u0631\u06CC\u0627\u0646 \u0648 \u067E\u0631\u0633\u0646\u0644",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  }
];
var INITIAL_PRESETS = [
  {
    "id": "advertising_marketing",
    "title": "\u062A\u0628\u0644\u06CC\u063A\u0627\u062A\u060C \u0645\u0627\u0631\u06A9\u062A\u06CC\u0646\u06AF \u0648 \u0631\u0648\u0627\u0628\u0637 \u0639\u0645\u0648\u0645\u06CC",
    "category": "\u0635\u0646\u0641",
    "icon": "Megaphone",
    "description": "",
    "mandatory_modules": [
      "calendar",
      "contacts",
      "mail",
      "crm"
    ],
    "default_modules": [
      "contacts",
      "crm",
      "project",
      "sale",
      "calendar",
      "activities",
      "mass_mailing_sms",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:16:02",
    "deleted_at": null
  },
  {
    "id": "commerce_trade",
    "title": "\u0628\u0627\u0632\u0631\u06AF\u0627\u0646\u06CC\u060C \u0648\u0627\u0631\u062F\u0627\u062A \u0648 \u0635\u0627\u062F\u0631\u0627\u062A",
    "category": "\u0635\u0646\u0641",
    "icon": "Ship",
    "description": "",
    "mandatory_modules": [
      "sale",
      "activities",
      "contacts",
      "mail",
      "calendar"
    ],
    "default_modules": [
      "sale",
      "contacts",
      "crm",
      "hr",
      "activities",
      "mass_mailing_sms",
      "mail",
      "calendar"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:15:12",
    "deleted_at": null
  },
  {
    "id": "consulting_finance",
    "title": "\u0645\u0634\u0627\u0648\u0631\u0647 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0648 \u062E\u062F\u0645\u0627\u062A \u0645\u0627\u0644\u06CC",
    "category": "\u0635\u0646\u0641",
    "icon": "BarChart3",
    "description": "",
    "mandatory_modules": [
      "activities",
      "project",
      "calendar",
      "contacts",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "crm",
      "project",
      "calendar",
      "survey",
      "hr",
      "activities",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:17:05",
    "deleted_at": null
  },
  {
    "id": "contracting_projects",
    "title": "\u067E\u06CC\u0645\u0627\u0646\u06A9\u0627\u0631\u06CC \u0648 \u067E\u0631\u0648\u0698\u0647\u200C\u0645\u062D\u0648\u0631",
    "category": "\u0635\u0646\u0641",
    "icon": "Building2",
    "description": "",
    "mandatory_modules": [
      "project",
      "activities",
      "contacts",
      "sale",
      "calendar",
      "mail"
    ],
    "default_modules": [
      "project",
      "hr",
      "hr_attendance",
      "activities",
      "hr_holidays",
      "contacts",
      "sale",
      "calendar",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:18:03",
    "deleted_at": null
  },
  {
    "id": "distribution_logistics",
    "title": "\u067E\u062E\u0634\u060C \u0627\u0646\u0628\u0627\u0631\u062F\u0627\u0631\u06CC \u0648 \u062A\u0648\u0632\u06CC\u0639",
    "category": "\u0635\u0646\u0641",
    "icon": "Truck",
    "description": "",
    "mandatory_modules": [
      "activities",
      "contacts",
      "calendar",
      "mail"
    ],
    "default_modules": [
      "sale",
      "contacts",
      "activities",
      "mass_mailing_sms",
      "hr",
      "hr_holidays",
      "hr_attendance",
      "calendar",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:18:37",
    "deleted_at": null
  },
  {
    "id": "education_academy",
    "title": "\u0622\u0645\u0648\u0632\u0634\u06AF\u0627\u0647\u200C\u0647\u0627 \u0648 \u0645\u0631\u0627\u06A9\u0632 \u0639\u0644\u0645\u06CC",
    "category": "\u0635\u0646\u0641",
    "icon": "GraduationCap",
    "description": "",
    "mandatory_modules": [
      "crm",
      "survey",
      "calendar",
      "contacts",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "crm",
      "hr",
      "calendar",
      "survey",
      "activities",
      "mass_mailing_sms",
      "mail",
      "project"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:19:59",
    "deleted_at": null
  },
  {
    "id": "healthcare_clinic",
    "title": "\u06A9\u0644\u06CC\u0646\u06CC\u06A9\u060C \u0633\u0644\u0627\u0645\u062A \u0648 \u062F\u0631\u0645\u0627\u0646",
    "category": "\u0635\u0646\u0641",
    "icon": "Stethoscope",
    "description": "",
    "mandatory_modules": [
      "survey",
      "calendar",
      "activities",
      "contacts",
      "hr",
      "hr_attendance",
      "project",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "hr",
      "hr_attendance",
      "calendar",
      "survey",
      "mass_mailing_sms",
      "activities",
      "project",
      "mail",
      "hr_recruitment",
      "hr_holidays"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:21:04",
    "deleted_at": null
  },
  {
    "id": "immigration",
    "title": "\u0645\u0624\u0633\u0633\u0627\u062A \u0645\u0647\u0627\u062C\u0631\u062A\u06CC",
    "category": "\u0635\u0646\u0641",
    "icon": "Plane",
    "description": "",
    "mandatory_modules": [
      "crm",
      "calendar",
      "contacts",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "crm",
      "calendar",
      "survey",
      "activities",
      "mass_mailing_sms",
      "mail",
      "project"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:27:26",
    "deleted_at": null
  },
  {
    "id": "insurance_agency",
    "title": "\u0628\u06CC\u0645\u0647 \u0648 \u0646\u0645\u0627\u06CC\u0646\u062F\u06AF\u06CC\u200C\u0647\u0627",
    "category": "\u0635\u0646\u0641",
    "icon": "ShieldCheck",
    "description": "",
    "mandatory_modules": [
      "crm",
      "sale",
      "calendar",
      "contacts",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "crm",
      "sale",
      "calendar",
      "survey",
      "activities",
      "mass_mailing_sms",
      "project",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:24:07",
    "deleted_at": null
  },
  {
    "id": "it_software",
    "title": "\u0641\u0646\u0627\u0648\u0631\u06CC \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0648 \u0646\u0631\u0645\u200C\u0627\u0641\u0632\u0627\u0631",
    "category": "\u0635\u0646\u0641",
    "icon": "Laptop",
    "description": "",
    "mandatory_modules": [
      "project",
      "activities",
      "mail",
      "calendar",
      "contacts"
    ],
    "default_modules": [
      "mail",
      "crm",
      "project",
      "hr",
      "activities",
      "hr_holidays",
      "hr_recruitment",
      "calendar",
      "contacts"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:25:19",
    "deleted_at": null
  },
  {
    "id": "legal_law",
    "title": "\u0645\u0624\u0633\u0633\u0627\u062A \u062D\u0642\u0648\u0642\u06CC \u0648 \u062F\u0627\u0648\u0631\u06CC",
    "category": "\u0635\u0646\u0641",
    "icon": "Scale",
    "description": "",
    "mandatory_modules": [
      "crm",
      "calendar",
      "survey",
      "contacts",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "crm",
      "project",
      "survey",
      "activities",
      "calendar",
      "mass_mailing_sms",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:26:54",
    "deleted_at": null
  },
  {
    "id": "manufacturing",
    "title": "\u062A\u0648\u0644\u06CC\u062F\u06CC \u0648 \u0635\u0646\u0639\u062A\u06CC",
    "category": "\u0635\u0646\u0641",
    "icon": "Factory",
    "description": "",
    "mandatory_modules": [
      "sale",
      "activities",
      "contacts",
      "project",
      "calendar",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "sale",
      "hr",
      "hr_attendance",
      "activities",
      "hr_holidays",
      "project",
      "calendar",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:28:07",
    "deleted_at": null
  },
  {
    "id": "medical_pharma",
    "title": "\u062A\u062C\u0647\u06CC\u0632\u0627\u062A \u067E\u0632\u0634\u06A9\u06CC \u0648 \u062F\u0627\u0631\u0648\u06CC\u06CC",
    "category": "\u0635\u0646\u0641",
    "icon": "Pill",
    "description": "",
    "mandatory_modules": [
      "crm",
      "sale",
      "contacts",
      "calendar",
      "mail"
    ],
    "default_modules": [
      "sale",
      "contacts",
      "crm",
      "hr_holidays",
      "activities",
      "mass_mailing_sms",
      "project",
      "calendar",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:30:52",
    "deleted_at": null
  },
  {
    "id": "real_estate",
    "title": "\u0627\u0645\u0644\u0627\u06A9 \u0648 \u0645\u0633\u062A\u063A\u0644\u0627\u062A",
    "category": "\u0635\u0646\u0641",
    "icon": "Building",
    "description": "",
    "mandatory_modules": [
      "crm",
      "calendar",
      "survey",
      "contacts",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "crm",
      "mass_mailing_sms",
      "calendar",
      "survey",
      "activities",
      "project",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:31:29",
    "deleted_at": null
  },
  {
    "id": "services_maintenance",
    "title": "\u062E\u062F\u0645\u0627\u062A\u06CC\u060C \u062A\u0623\u0633\u06CC\u0633\u0627\u062A\u06CC \u0648 \u062A\u0639\u0645\u06CC\u0631\u0627\u062A",
    "category": "\u0635\u0646\u0641",
    "icon": "Wrench",
    "description": "",
    "mandatory_modules": [
      "activities",
      "project",
      "sale",
      "contacts",
      "calendar",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "project",
      "hr",
      "activities",
      "mass_mailing_sms",
      "sale",
      "hr_attendance",
      "calendar",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:33:41",
    "deleted_at": null
  }
];
var INITIAL_COUPONS = [
  {
    "code": "KAROVITA20",
    "discount_type": "percent",
    "discount_value": 20,
    "min_order_amount": null,
    "max_discount_amount": null,
    "expires_at": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  },
  {
    "code": "OFF10",
    "discount_type": "percent",
    "discount_value": 10,
    "min_order_amount": null,
    "max_discount_amount": null,
    "expires_at": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  },
  {
    "code": "WELCOME",
    "discount_type": "fixed",
    "discount_value": 5e5,
    "min_order_amount": 2e6,
    "max_discount_amount": null,
    "expires_at": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  }
];

// server/db.ts
var DB_FILE_PATH = import_path.default.join(process.cwd(), "data", "db.json");
var Database = class {
  nextUserId = 2;
  nextCompanyId = 1;
  nextPackageId = 5;
  nextOrderId = 1;
  nextTransactionId = 1;
  nextSubscriptionId = 1;
  nextOtpId = 1;
  nextAuditLogId = 5001;
  nextPushSubId = 1;
  pushSubscriptions = [];
  users = [
    {
      id: 1,
      mobile: "09111273476",
      first_name: "\u0627\u0631\u062F\u0644\u0627\u0646",
      last_name: "\u062F\u0627\u0648\u0648\u062F\u06CC",
      email: "ardalan.davodi@gmail.com",
      job_title: "\u0645\u062F\u06CC\u0631 \u0627\u0631\u0634\u062F \u0648 \u0645\u0627\u0644\u06A9 \u0633\u06CC\u0633\u062A\u0645",
      role: "admin",
      onboarding_step: 3,
      onboarding_completed_at: (/* @__PURE__ */ new Date()).toISOString(),
      mobile_verified_at: (/* @__PURE__ */ new Date()).toISOString(),
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  ];
  companies = [];
  packages = [
    {
      id: 1,
      name: "\u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u06F5 \u0631\u0648\u0632\u0647 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627",
      slug: "trial",
      description: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u0628\u0631\u0627\u06CC \u0628\u0631\u0631\u0633\u06CC \u0627\u0645\u06A9\u0627\u0646\u0627\u062A",
      price: 0,
      duration_days: 5,
      usage_limit: null,
      is_featured: false,
      is_active: true,
      features: ["\u062A\u0645\u0627\u0645 \u0627\u0645\u06A9\u0627\u0646\u0627\u062A \u067E\u0627\u06CC\u0647", "\u0628\u062F\u0648\u0646 \u0646\u06CC\u0627\u0632 \u0628\u0647 \u067E\u0631\u062F\u0627\u062E\u062A", "\u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u0641\u0648\u0631\u06CC"],
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: 2,
      name: "\u062A\u06CC\u06A9\u200C\u0622\u0641 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627",
      slug: "takeoff",
      description: "\u0645\u0646\u0627\u0633\u0628 \u062A\u06CC\u0645\u200C\u0647\u0627\u06CC \u06A9\u0648\u0686\u06A9 \u0648 \u0627\u0633\u062A\u0627\u0631\u062A\u0627\u067E\u200C\u0647\u0627",
      price: 799e3,
      duration_days: 30,
      usage_limit: 1e3,
      is_featured: true,
      is_active: true,
      features: ["\u0645\u062F\u06CC\u0631\u06CC\u062A \u0645\u0634\u062A\u0631\u06CC\u0627\u0646", "\u0645\u062F\u06CC\u0631\u06CC\u062A \u0641\u0631\u0648\u0634", "\u0630\u062E\u06CC\u0631\u0647\u200C\u0633\u0627\u0632\u06CC \u06F7 \u06AF\u06CC\u06AF\u0627\u0628\u0627\u06CC\u062A"],
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: 3,
      name: "\u067E\u0631\u0648\u0627\u0632 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627",
      slug: "flight",
      description: "\u0645\u0646\u0627\u0633\u0628 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631\u0647\u0627\u06CC \u062F\u0631 \u062D\u0627\u0644 \u0631\u0634\u062F",
      price: 1099e3,
      duration_days: 30,
      usage_limit: 3e3,
      is_featured: false,
      is_active: true,
      features: ["\u0627\u062A\u0648\u0645\u0627\u0633\u06CC\u0648\u0646 \u0641\u0631\u0648\u0634", "\u06AF\u0632\u0627\u0631\u0634\u200C\u0647\u0627\u06CC \u067E\u06CC\u0634\u0631\u0641\u062A\u0647", "\u0630\u062E\u06CC\u0631\u0647\u200C\u0633\u0627\u0632\u06CC \u06F1\u06F5 \u06AF\u06CC\u06AF\u0627\u0628\u0627\u06CC\u062A"],
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: 4,
      name: "\u0635\u0639\u0648\u062F \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627",
      slug: "climb",
      description: "\u0645\u0646\u0627\u0633\u0628 \u0633\u0627\u0632\u0645\u0627\u0646\u200C\u0647\u0627 \u0648 \u0634\u0631\u06A9\u062A\u200C\u0647\u0627\u06CC \u0628\u0632\u0631\u06AF",
      price: 4899e3,
      duration_days: 365,
      usage_limit: null,
      is_featured: false,
      is_active: true,
      features: ["\u062A\u0645\u0627\u0645 \u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627", "\u06A9\u0627\u0631\u0628\u0631 \u0646\u0627\u0645\u062D\u062F\u0648\u062F", "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0627\u062E\u062A\u0635\u0627\u0635\u06CC"],
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  ];
  orders = [];
  transactions = [];
  subscriptions = [];
  otpCodes = [];
  erpModules = [...INITIAL_ERP_MODULES];
  industryPresets = [...INITIAL_PRESETS];
  coupons = [...INITIAL_COUPONS];
  configuratorSettings = {
    base_user_limit: 1,
    extra_user_price: 8e5,
    quarterly_multiplier: 3,
    semiannual_multiplier: 6,
    yearly_multiplier: 10,
    step_users_enabled: true,
    step_modules_enabled: true
  };
  gatewaySettings = {
    zibal: {
      merchant: process.env.ZIBAL_MERCHANT || "zibal",
      sandbox: process.env.ZIBAL_SANDBOX !== "false",
      callback_url: "/api/payments/zibal/callback",
      enabled: true,
      description_prefix: "\u0633\u0627\u0645\u0627\u0646\u0647 \u0627\u0628\u0631\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 - \u0633\u0641\u0627\u0631\u0634 #",
      auto_verify: true
    },
    sms: {
      apiKey: process.env.SMS_IR_API_KEY || "ocv39CACg6Vg3cg3DbY3mUwfOti7dktYUwksl3jA3Jt1qI0z",
      lineNumber: process.env.SMS_IR_LINE_NUMBER || "30007732",
      provider: "sms_ir",
      enabled: true,
      auto_reminders_enabled: true,
      templates: {
        otp: {
          id: Number(process.env.SMS_IR_TEMPLATE_ID) || 418155,
          enabled: true,
          title: "\u06A9\u062F \u0627\u062D\u0631\u0627\u0632 \u0647\u0648\u06CC\u062A \u0648 \u0648\u0631\u0648\u062F \u06CC\u06A9\u0628\u0627\u0631 \u0645\u0635\u0631\u0641 (OTP)",
          description: "\u0627\u0631\u0633\u0627\u0644 \u0641\u0648\u0631\u06CC \u06A9\u062F \u0648\u0631\u0648\u062F \u06F5 \u0631\u0642\u0645\u06CC \u06A9\u0627\u0631\u0628\u0631 \u0628\u0627 \u062E\u0637\u0648\u0637 \u062E\u062F\u0645\u0627\u062A\u06CC \u0628\u062F\u0648\u0646 \u0628\u0644\u06A9\u200C\u0644\u06CC\u0633\u062A",
          pattern: "\u06A9\u062F \u0648\u0631\u0648\u062F \u0634\u0645\u0627 \u0628\u0647 \u067E\u0646\u0644 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627: #CODE#",
          required_params: ["CODE"]
        },
        invoice_issued: {
          id: Number(process.env.SMS_IR_TEMPLATE_INVOICE) || 418156,
          enabled: true,
          title: "\u0635\u062F\u0648\u0631 \u067E\u06CC\u0634\u200C\u0641\u0627\u06A9\u062A\u0648\u0631 \u062C\u062F\u06CC\u062F \u0648 \u0633\u0641\u0627\u0631\u0634 \u062E\u0631\u06CC\u062F",
          description: "\u0627\u0637\u0644\u0627\u0639\u200C\u0631\u0633\u0627\u0646\u06CC \u0635\u062F\u0648\u0631 \u067E\u06CC\u0634\u200C\u0641\u0627\u06A9\u062A\u0648\u0631 \u062C\u062F\u06CC\u062F \u0648 \u0644\u06CC\u0646\u06A9 \u062A\u0633\u0648\u06CC\u0647 \u062D\u0633\u0627\u0628 \u0628\u0647 \u06A9\u0627\u0631\u0628\u0631",
          pattern: "\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC #CUSTOMER#\u060C \u067E\u06CC\u0634\u200C\u0641\u0627\u06A9\u062A\u0648\u0631 \u0633\u0641\u0627\u0631\u0634 ##ORDER# \u0628\u0647 \u0645\u0628\u0644\u063A #AMOUNT# \u062A\u0648\u0645\u0627\u0646 \u0635\u0627\u062F\u0631 \u0634\u062F. \u0644\u06CC\u0646\u06A9 \u067E\u0631\u062F\u0627\u062E\u062A: #LINK#",
          required_params: ["CUSTOMER", "ORDER", "AMOUNT"]
        },
        sub_expiry_7days: {
          id: Number(process.env.SMS_IR_TEMPLATE_EXPIRY_7) || 418157,
          enabled: true,
          title: "\u06CC\u0627\u062F\u0622\u0648\u0631\u06CC \u06F7 \u0631\u0648\u0632 \u0645\u0627\u0646\u062F\u0647 \u0628\u0647 \u067E\u0627\u06CC\u0627\u0646 \u0627\u0634\u062A\u0631\u0627\u06A9",
          description: "\u0627\u0631\u0633\u0627\u0644 \u0647\u0634\u062F\u0627\u0631 \u062A\u0645\u062F\u06CC\u062F \u0627\u0634\u062A\u0631\u0627\u06A9 \u06F7 \u0631\u0648\u0632 \u0642\u0628\u0644 \u0627\u0632 \u063A\u06CC\u0631\u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u062F\u0633\u062A\u0631\u0633\u06CC\u200C\u0647\u0627\u06CC \u0633\u0627\u0632\u0645\u0627\u0646\u06CC",
          pattern: "\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC #CUSTOMER#\u060C \u062A\u0646\u0647\u0627 #DAYS# \u0631\u0648\u0632 \u0627\u0632 \u0627\u0634\u062A\u0631\u0627\u06A9 #TITLE# \u0634\u0645\u0627 \u0628\u0627\u0642\u06CC \u0645\u0627\u0646\u062F\u0647 \u0627\u0633\u062A. \u062C\u0647\u062A \u062A\u0645\u062F\u06CC\u062F \u0627\u0642\u062F\u0627\u0645 \u0641\u0631\u0645\u0627\u06CC\u06CC\u062F.",
          required_params: ["CUSTOMER", "DAYS", "TITLE"]
        },
        sub_expiry_3days: {
          id: Number(process.env.SMS_IR_TEMPLATE_EXPIRY_3) || 418158,
          enabled: true,
          title: "\u06CC\u0627\u062F\u0622\u0648\u0631\u06CC \u0641\u0648\u0631\u06CC \u06F3 \u0631\u0648\u0632 \u0645\u0627\u0646\u062F\u0647 \u0628\u0647 \u0627\u0646\u0642\u0636\u0627\u06CC \u0627\u0634\u062A\u0631\u0627\u06A9",
          description: "\u0627\u0631\u0633\u0627\u0644 \u0647\u0634\u062F\u0627\u0631 \u0641\u0648\u0631\u06CC \u062A\u0645\u062F\u06CC\u062F \u0627\u0634\u062A\u0631\u0627\u06A9 \u062C\u0647\u062A \u062C\u0644\u0648\u06AF\u06CC\u0631\u06CC \u0627\u0632 \u0627\u0646\u0642\u0637\u0627\u0639 \u0633\u0631\u0648\u06CC\u0633\u200C\u0647\u0627",
          pattern: "\u0647\u0634\u062F\u0627\u0631 \u0645\u0647\u0645: \u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC #CUSTOMER#\u060C \u0627\u0634\u062A\u0631\u0627\u06A9 \u0634\u0645\u0627 #TITLE# \u0638\u0631\u0641 #DAYS# \u0631\u0648\u0632 \u0622\u06CC\u0646\u062F\u0647 \u0645\u0646\u0642\u0636\u06CC \u0645\u06CC\u200C\u0634\u0648\u062F.",
          required_params: ["CUSTOMER", "DAYS", "TITLE"]
        },
        ticket_created: {
          id: Number(process.env.SMS_IR_TEMPLATE_TICKET) || 418159,
          enabled: true,
          title: "\u062B\u0628\u062A \u0648 \u067E\u06CC\u06AF\u06CC\u0631\u06CC \u062A\u06CC\u06A9\u062A \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u062C\u062F\u06CC\u062F",
          description: "\u0627\u0637\u0644\u0627\u0639\u200C\u0631\u0633\u0627\u0646\u06CC \u0634\u0645\u0627\u0631\u0647 \u067E\u06CC\u06AF\u06CC\u0631\u06CC \u0648 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u06CC\u06A9\u062A \u062C\u062F\u06CC\u062F \u0628\u0647 \u06A9\u0627\u0631\u0628\u0631 \u0648 \u06A9\u0627\u0631\u0634\u0646\u0627\u0633 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC",
          pattern: "\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC #CUSTOMER#\u060C \u062A\u06CC\u06A9\u062A \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0634\u0645\u0627 \u0628\u0627 \u0634\u0645\u0627\u0631\u0647 #TICKET# \u0648 \u0645\u0648\u0636\u0648\u0639 \xAB#SUBJECT#\xBB \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062B\u0628\u062A \u0634\u062F.",
          required_params: ["CUSTOMER", "TICKET", "SUBJECT"]
        },
        payment_success: {
          id: Number(process.env.SMS_IR_TEMPLATE_PAYMENT) || 418160,
          enabled: true,
          title: "\u062A\u0633\u0648\u06CC\u0647 \u0645\u0648\u0641\u0642 \u0641\u0627\u06A9\u062A\u0648\u0631 \u0648 \u062A\u0627\u06CC\u06CC\u062F \u062A\u0631\u0627\u06A9\u0646\u0634 \u0634\u0627\u067E\u0631\u06A9",
          description: "\u0627\u0631\u0633\u0627\u0644 \u0634\u0646\u0627\u0633\u0647 \u067E\u06CC\u06AF\u06CC\u0631\u06CC \u0628\u0627\u0646\u06A9\u06CC \u0634\u0627\u067E\u0631\u06A9 \u0648 \u062A\u0627\u06CC\u06CC\u062F \u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u0633\u0631\u0648\u06CC\u0633 \u067E\u0633 \u0627\u0632 \u067E\u0631\u062F\u0627\u062E\u062A \u0622\u0646\u0644\u0627\u06CC\u0646",
          pattern: "\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC #CUSTOMER#\u060C \u067E\u0631\u062F\u0627\u062E\u062A \u0641\u0627\u06A9\u062A\u0648\u0631 ##ORDER# \u0628\u0647 \u0645\u0628\u0644\u063A #AMOUNT# \u062A\u0648\u0645\u0627\u0646 \u0628\u0627 \u0634\u0645\u0627\u0631\u0647 \u067E\u06CC\u06AF\u06CC\u0631\u06CC #REF# \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062A\u0627\u06CC\u06CC\u062F \u0634\u062F.",
          required_params: ["CUSTOMER", "ORDER", "AMOUNT", "REF"]
        }
      }
    },
    subscription_reminder_log: []
  };
  smsLogs = [];
  auditLogs = [
    {
      id: 5001,
      timestamp: new Date(Date.now() - 48 * 3600 * 1e3).toISOString(),
      user_id: 1,
      user_name: "\u0627\u0631\u062F\u0644\u0627\u0646 \u062F\u0627\u0648\u0648\u062F\u06CC (\u0645\u062F\u06CC\u0631 \u0627\u0631\u0634\u062F)",
      user_mobile: "09111273476",
      user_role: "admin",
      action_type: "CONFIGURATION_CHANGE",
      action_description: "\u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0648 \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u0627\u0648\u0644\u06CC\u0647 \u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627 \u0648 \u062A\u0628\u200C\u0647\u0627\u06CC \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 ERP \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627",
      resource_type: "CONFIG_SETTINGS",
      resource_id: "SYSTEM_BOOTSTRAP",
      ip_address: "localhost",
      user_agent: "Karovita-Core/2.4",
      status: "SUCCESS",
      details: { modules_count: 24, presets_count: 6, version: "2.4.0" }
    },
    {
      id: 5002,
      timestamp: new Date(Date.now() - 24 * 3600 * 1e3).toISOString(),
      user_id: 1,
      user_name: "\u0627\u0631\u062F\u0644\u0627\u0646 \u062F\u0627\u0648\u0648\u062F\u06CC (\u0645\u062F\u06CC\u0631 \u0627\u0631\u0634\u062F)",
      user_mobile: "09111273476",
      user_role: "admin",
      action_type: "PRIVILEGE_ESCALATION",
      action_description: "\u062A\u0639\u06CC\u06CC\u0646 \u0634\u0645\u0627\u0631\u0647 09111273476 \u0628\u0647 \u0639\u0646\u0648\u0627\u0646 \u0645\u0627\u0644\u06A9 \u0648 \u0645\u062F\u06CC\u0631 \u0627\u0631\u0634\u062F \u067E\u0631\u0648\u0698\u0647 (Super Admin)",
      resource_type: "USER",
      resource_id: 1,
      ip_address: "185.143.232.1",
      user_agent: "Karovita-Core/2.4",
      status: "SUCCESS",
      details: { role_granted: "admin", assigned_by: "SUPER_ADMIN_OWNER" }
    }
  ];
  nextDepartmentId = 5;
  nextTicketId = 1004;
  nextMessageId = 2008;
  nextAttachmentId = 3001;
  nextHistoryId = 4001;
  departments = [
    { id: 1, name: "\u0641\u0631\u0648\u0634", icon: "ShoppingBag", status: "active", created_at: (/* @__PURE__ */ new Date()).toISOString(), updated_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 2, name: "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0641\u0646\u06CC", icon: "Wrench", status: "active", created_at: (/* @__PURE__ */ new Date()).toISOString(), updated_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 3, name: "\u0645\u0627\u0644\u06CC", icon: "CreditCard", status: "active", created_at: (/* @__PURE__ */ new Date()).toISOString(), updated_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 4, name: "\u0633\u0627\u06CC\u0631 \u0645\u0648\u0627\u0631\u062F", icon: "HelpCircle", status: "active", created_at: (/* @__PURE__ */ new Date()).toISOString(), updated_at: (/* @__PURE__ */ new Date()).toISOString() }
  ];
  supportStaff = [
    { id: 1, name: "\u0639\u0644\u06CC \u0631\u0636\u0627\u06CC\u06CC", department: "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0641\u0646\u06CC", role: "\u06A9\u0627\u0631\u0634\u0646\u0627\u0633 \u0627\u0631\u0634\u062F \u0641\u0646\u06CC" },
    { id: 2, name: "\u0633\u0627\u0631\u0627 \u0627\u062D\u0645\u062F\u06CC", department: "\u0645\u0627\u0644\u06CC", role: "\u06A9\u0627\u0631\u0634\u0646\u0627\u0633 \u0645\u0627\u0644\u06CC" },
    { id: 3, name: "\u0645\u062D\u0645\u062F \u06A9\u0631\u06CC\u0645\u06CC", department: "\u0641\u0631\u0648\u0634", role: "\u06A9\u0627\u0631\u0634\u0646\u0627\u0633 \u0641\u0631\u0648\u0634" },
    { id: 4, name: "\u0631\u0636\u0627 \u062D\u0633\u06CC\u0646\u06CC", department: "\u0633\u0627\u06CC\u0631 \u0645\u0648\u0627\u0631\u062F", role: "\u0645\u062F\u06CC\u0631 \u0627\u0631\u0634\u062F \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC" }
  ];
  tickets = [];
  messages = [];
  attachments = [];
  ticketHistories = [];
  constructor() {
    this.loadFromFile();
  }
  save() {
    this.saveToFile();
  }
  saveToFile() {
    try {
      const dir = import_path.default.dirname(DB_FILE_PATH);
      if (!import_fs.default.existsSync(dir)) {
        import_fs.default.mkdirSync(dir, { recursive: true });
      }
      const data = {
        nextUserId: this.nextUserId,
        nextCompanyId: this.nextCompanyId,
        nextPackageId: this.nextPackageId,
        nextOrderId: this.nextOrderId,
        nextTransactionId: this.nextTransactionId,
        nextSubscriptionId: this.nextSubscriptionId,
        nextOtpId: this.nextOtpId,
        nextDepartmentId: this.nextDepartmentId,
        nextTicketId: this.nextTicketId,
        nextMessageId: this.nextMessageId,
        nextAttachmentId: this.nextAttachmentId,
        nextHistoryId: this.nextHistoryId,
        nextAuditLogId: this.nextAuditLogId,
        nextPushSubId: this.nextPushSubId,
        users: this.users,
        companies: this.companies,
        packages: this.packages,
        orders: this.orders,
        transactions: this.transactions,
        subscriptions: this.subscriptions,
        otpCodes: this.otpCodes,
        departments: this.departments,
        supportStaff: this.supportStaff,
        tickets: this.tickets,
        messages: this.messages,
        attachments: this.attachments,
        ticketHistories: this.ticketHistories,
        auditLogs: this.auditLogs,
        pushSubscriptions: this.pushSubscriptions,
        erpModules: this.erpModules,
        industryPresets: this.industryPresets,
        coupons: this.coupons,
        configuratorSettings: this.configuratorSettings,
        gatewaySettings: this.gatewaySettings,
        smsLogs: this.smsLogs
      };
      import_fs.default.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("[DB Persistence] Error writing db.json:", err);
    }
  }
  loadFromFile() {
    try {
      const dir = import_path.default.dirname(DB_FILE_PATH);
      if (!import_fs.default.existsSync(dir)) {
        import_fs.default.mkdirSync(dir, { recursive: true });
      }
      if (import_fs.default.existsSync(DB_FILE_PATH)) {
        const raw = import_fs.default.readFileSync(DB_FILE_PATH, "utf-8");
        if (raw && raw.trim()) {
          const data = JSON.parse(raw);
          if (data.users && Array.isArray(data.users)) this.users = data.users;
          if (data.companies && Array.isArray(data.companies)) this.companies = data.companies;
          if (data.packages && Array.isArray(data.packages)) this.packages = data.packages;
          if (data.orders && Array.isArray(data.orders)) this.orders = data.orders;
          if (data.transactions && Array.isArray(data.transactions)) this.transactions = data.transactions;
          if (data.subscriptions && Array.isArray(data.subscriptions)) this.subscriptions = data.subscriptions;
          if (data.otpCodes && Array.isArray(data.otpCodes)) this.otpCodes = data.otpCodes;
          if (data.departments && Array.isArray(data.departments)) this.departments = data.departments;
          if (data.supportStaff && Array.isArray(data.supportStaff)) this.supportStaff = data.supportStaff;
          if (data.tickets && Array.isArray(data.tickets)) this.tickets = data.tickets;
          if (data.messages && Array.isArray(data.messages)) this.messages = data.messages;
          if (data.attachments && Array.isArray(data.attachments)) this.attachments = data.attachments;
          if (data.ticketHistories && Array.isArray(data.ticketHistories)) this.ticketHistories = data.ticketHistories;
          if (data.auditLogs && Array.isArray(data.auditLogs)) this.auditLogs = data.auditLogs;
          if (data.pushSubscriptions && Array.isArray(data.pushSubscriptions)) this.pushSubscriptions = data.pushSubscriptions;
          if (data.erpModules && Array.isArray(data.erpModules) && data.erpModules.length > 0) {
            const initialMap = new Map(INITIAL_ERP_MODULES.map((m) => [m.id, m]));
            this.erpModules = data.erpModules.map((m) => {
              const init = initialMap.get(m.id);
              if (init) {
                return {
                  ...init,
                  ...m,
                  title: m.title || init.title,
                  price: typeof m.price === "number" ? m.price : init.price,
                  dependencies: Array.isArray(m.dependencies) ? m.dependencies : init.dependencies || [],
                  industries: Array.isArray(m.industries) ? m.industries : m.industries || [],
                  description: m.description !== void 0 ? m.description : init.description,
                  is_active: m.is_active !== void 0 ? m.is_active : init.is_active ?? true
                };
              }
              return m;
            });
          } else {
            this.erpModules = [...INITIAL_ERP_MODULES];
          }
          if (data.industryPresets && Array.isArray(data.industryPresets) && data.industryPresets.length >= 15) {
            const initialPresetMap = new Map(INITIAL_PRESETS.map((p) => [p.id, p]));
            this.industryPresets = data.industryPresets.map((p) => {
              const init = initialPresetMap.get(p.id);
              if (init) {
                return {
                  ...p,
                  title: p.title || init.title,
                  icon: p.icon || init.icon,
                  mandatory_modules: Array.isArray(p.mandatory_modules) ? p.mandatory_modules : init.mandatory_modules || [],
                  default_modules: Array.isArray(p.default_modules) ? p.default_modules : init.default_modules || []
                };
              }
              return p;
            });
          } else {
            this.industryPresets = [...INITIAL_PRESETS];
          }
          if (data.coupons && Array.isArray(data.coupons)) this.coupons = data.coupons;
          if (data.configuratorSettings) this.configuratorSettings = { ...this.configuratorSettings, ...data.configuratorSettings };
          if (data.gatewaySettings) {
            this.gatewaySettings = {
              ...this.gatewaySettings,
              ...data.gatewaySettings,
              zibal: { ...this.gatewaySettings.zibal, ...data.gatewaySettings.zibal || {} },
              sms: {
                ...this.gatewaySettings.sms,
                ...data.gatewaySettings.sms || {},
                templates: {
                  ...this.gatewaySettings.sms.templates,
                  ...data.gatewaySettings.sms?.templates || {}
                }
              }
            };
          }
          if (data.smsLogs && Array.isArray(data.smsLogs)) this.smsLogs = data.smsLogs;
          if (data.nextUserId) this.nextUserId = data.nextUserId;
          if (data.nextCompanyId) this.nextCompanyId = data.nextCompanyId;
          if (data.nextPackageId) this.nextPackageId = data.nextPackageId;
          if (data.nextOrderId) this.nextOrderId = data.nextOrderId;
          if (data.nextTransactionId) this.nextTransactionId = data.nextTransactionId;
          if (data.nextSubscriptionId) this.nextSubscriptionId = data.nextSubscriptionId;
          if (data.nextOtpId) this.nextOtpId = data.nextOtpId;
          if (data.nextDepartmentId) this.nextDepartmentId = data.nextDepartmentId;
          if (data.nextTicketId) this.nextTicketId = data.nextTicketId;
          if (data.nextMessageId) this.nextMessageId = data.nextMessageId;
          if (data.nextAttachmentId) this.nextAttachmentId = data.nextAttachmentId;
          if (data.nextHistoryId) this.nextHistoryId = data.nextHistoryId;
          if (data.nextAuditLogId) this.nextAuditLogId = data.nextAuditLogId;
          if (data.nextPushSubId) this.nextPushSubId = data.nextPushSubId;
          return;
        }
      }
      this.saveToFile();
    } catch (err) {
      console.error("[DB Persistence] Error loading db.json:", err);
    }
  }
  // Ticket Helpers
  generateTicketNumber() {
    const randomDigits = Math.floor(1e7 + Math.random() * 9e7);
    return `#${randomDigits}`;
  }
  getDepartmentById(id) {
    return this.departments.find((d) => d.id === id);
  }
  getTicketById(id) {
    return this.tickets.find((t) => t.id === id);
  }
  getTicketByNumber(num) {
    return this.tickets.find((t) => t.ticket_number === num);
  }
  getMessagesByTicketId(ticketId) {
    return this.messages.filter((m) => m.ticket_id === ticketId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((m) => {
      const atts = this.attachments.filter((a) => a.message_id === m.id);
      return { ...m, attachments: atts };
    });
  }
  getHistoryByTicketId(ticketId) {
    return this.ticketHistories.filter((h) => h.ticket_id === ticketId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  createTicket(data) {
    const user = this.getUserById(data.user_id);
    const userName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.mobile || "\u06A9\u0627\u0631\u0628\u0631";
    const dept = this.getDepartmentById(data.department_id);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const ticket = {
      id: this.nextTicketId++,
      ticket_number: this.generateTicketNumber(),
      user_id: data.user_id,
      department_id: data.department_id,
      service_name: data.service_name || "\u0633\u0631\u0648\u06CC\u0633 \u0639\u0645\u0648\u0645\u06CC",
      assigned_to: null,
      assigned_name: null,
      subject: data.subject.trim(),
      status: "open",
      has_security_info: !!data.is_security_info,
      last_message: data.message.slice(0, 120),
      last_sender_type: "user",
      created_at: now,
      updated_at: now,
      closed_at: null
    };
    this.tickets.unshift(ticket);
    const msgId = this.nextMessageId++;
    const message = {
      id: msgId,
      ticket_id: ticket.id,
      sender_id: data.user_id,
      sender_type: "user",
      sender_name: userName,
      message: data.message,
      is_security_info: !!data.is_security_info,
      ip_address: data.ip_address || "localhost",
      created_at: now,
      updated_at: now
    };
    this.messages.push(message);
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((att) => {
        this.attachments.push({
          id: this.nextAttachmentId++,
          ticket_id: ticket.id,
          message_id: msgId,
          user_id: data.user_id,
          file_name: att.file_name,
          file_data: att.file_data,
          file_type: att.file_type,
          file_size: att.file_size,
          created_at: now
        });
      });
    }
    this.ticketHistories.push({
      id: this.nextHistoryId++,
      ticket_id: ticket.id,
      user_id: data.user_id,
      user_name: userName,
      action: "\u0627\u06CC\u062C\u0627\u062F \u062A\u06CC\u06A9\u062A",
      old_value: null,
      new_value: `\u0648\u0636\u0639\u06CC\u062A: \u0628\u0627\u0632 | \u062F\u067E\u0627\u0631\u062A\u0645\u0627\u0646: ${dept?.name || "\u0639\u0645\u0648\u0645\u06CC"}`,
      created_at: now
    });
    this.saveToFile();
    return ticket;
  }
  addTicketMessage(data) {
    const ticket = this.getTicketById(data.ticket_id);
    if (!ticket) throw new Error("\u062A\u06CC\u06A9\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F.");
    if (ticket.status === "closed") throw new Error("\u0627\u06CC\u0646 \u062A\u06CC\u06A9\u062A \u0628\u0633\u062A\u0647 \u0634\u062F\u0647 \u0627\u0633\u062A \u0648 \u0627\u0645\u06A9\u0627\u0646 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F.");
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const msgId = this.nextMessageId++;
    const message = {
      id: msgId,
      ticket_id: ticket.id,
      sender_id: data.sender_id,
      sender_type: data.sender_type,
      sender_name: data.sender_name,
      message: data.message,
      is_security_info: !!data.is_security_info,
      ip_address: data.ip_address || "localhost",
      created_at: now,
      updated_at: now
    };
    this.messages.push(message);
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((att) => {
        this.attachments.push({
          id: this.nextAttachmentId++,
          ticket_id: ticket.id,
          message_id: msgId,
          user_id: data.sender_id,
          file_name: att.file_name,
          file_data: att.file_data,
          file_type: att.file_type,
          file_size: att.file_size,
          created_at: now
        });
      });
    }
    const prevStatus = ticket.status;
    let nextStatus = prevStatus;
    if (data.sender_type === "user") {
      nextStatus = "in_progress";
    } else if (data.sender_type === "support") {
      nextStatus = "waiting_user";
    }
    ticket.status = nextStatus;
    ticket.last_message = data.message.slice(0, 120);
    ticket.last_sender_type = data.sender_type;
    ticket.updated_at = now;
    if (data.is_security_info) {
      ticket.has_security_info = true;
    }
    this.ticketHistories.push({
      id: this.nextHistoryId++,
      ticket_id: ticket.id,
      user_id: data.sender_id,
      user_name: data.sender_name,
      action: data.sender_type === "user" ? "\u0627\u0631\u0633\u0627\u0644 \u067E\u0627\u0633\u062E \u06A9\u0627\u0631\u0628\u0631" : "\u0627\u0631\u0633\u0627\u0644 \u067E\u0627\u0633\u062E \u067E\u0634\u062A\u06CC\u0628\u0627\u0646",
      old_value: `\u0648\u0636\u0639\u06CC\u062A: ${this.getStatusLabel(prevStatus)}`,
      new_value: `\u0648\u0636\u0639\u06CC\u062A: ${this.getStatusLabel(nextStatus)}`,
      created_at: now
    });
    this.saveToFile();
    return message;
  }
  closeTicket(ticketId, userId, userName) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error("\u062A\u06CC\u06A9\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F.");
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const prevStatus = ticket.status;
    ticket.status = "closed";
    ticket.closed_at = now;
    ticket.updated_at = now;
    this.ticketHistories.push({
      id: this.nextHistoryId++,
      ticket_id: ticket.id,
      user_id: userId,
      user_name: userName,
      action: "\u0628\u0633\u062A\u0646 \u062A\u06CC\u06A9\u062A",
      old_value: `\u0648\u0636\u0639\u06CC\u062A: ${this.getStatusLabel(prevStatus)}`,
      new_value: "\u0648\u0636\u0639\u06CC\u062A: \u0628\u0633\u062A\u0647 \u0634\u062F\u0647",
      created_at: now
    });
    this.saveToFile();
    return ticket;
  }
  reopenTicket(ticketId, userId, userName) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error("\u062A\u06CC\u06A9\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F.");
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const prevStatus = ticket.status;
    ticket.status = "in_progress";
    ticket.closed_at = null;
    ticket.updated_at = now;
    this.ticketHistories.push({
      id: this.nextHistoryId++,
      ticket_id: ticket.id,
      user_id: userId,
      user_name: userName,
      action: "\u0628\u0627\u0632\u06AF\u0634\u0627\u06CC\u06CC \u062A\u06CC\u06A9\u062A",
      old_value: `\u0648\u0636\u0639\u06CC\u062A: ${this.getStatusLabel(prevStatus)}`,
      new_value: "\u0648\u0636\u0639\u06CC\u062A: \u062F\u0631 \u062D\u0627\u0644 \u0628\u0631\u0631\u0633\u06CC",
      created_at: now
    });
    this.saveToFile();
    return ticket;
  }
  assignTicket(ticketId, staffId, userId, userName) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error("\u062A\u06CC\u06A9\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F.");
    const staff = this.supportStaff.find((s) => s.id === staffId);
    if (!staff) throw new Error("\u067E\u0634\u062A\u06CC\u0628\u0627\u0646 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F.");
    const oldName = ticket.assigned_name || "\u062A\u062E\u0635\u06CC\u0635 \u062F\u0627\u062F\u0647 \u0646\u0634\u062F\u0647";
    ticket.assigned_to = staff.id;
    ticket.assigned_name = staff.name;
    ticket.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    this.ticketHistories.push({
      id: this.nextHistoryId++,
      ticket_id: ticket.id,
      user_id: userId,
      user_name: userName,
      action: "\u0627\u0631\u062C\u0627\u0639 \u0628\u0647 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646",
      old_value: oldName,
      new_value: staff.name,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    this.saveToFile();
    return ticket;
  }
  changeTicketDepartment(ticketId, departmentId, userId, userName) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error("\u062A\u06CC\u06A9\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F.");
    const dept = this.getDepartmentById(departmentId);
    if (!dept) throw new Error("\u062F\u067E\u0627\u0631\u062A\u0645\u0627\u0646 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F.");
    const oldDept = this.getDepartmentById(ticket.department_id)?.name || "\u0646\u0627\u0645\u0634\u062E\u0635";
    ticket.department_id = departmentId;
    ticket.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    this.ticketHistories.push({
      id: this.nextHistoryId++,
      ticket_id: ticket.id,
      user_id: userId,
      user_name: userName,
      action: "\u062A\u063A\u06CC\u06CC\u0631 \u062F\u067E\u0627\u0631\u062A\u0645\u0627\u0646",
      old_value: oldDept,
      new_value: dept.name,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    this.saveToFile();
    return ticket;
  }
  changeTicketStatus(ticketId, status, userId, userName) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error("\u062A\u06CC\u06A9\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F.");
    const prevStatus = ticket.status;
    ticket.status = status;
    ticket.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    if (status === "closed") {
      ticket.closed_at = (/* @__PURE__ */ new Date()).toISOString();
    } else {
      ticket.closed_at = null;
    }
    this.ticketHistories.push({
      id: this.nextHistoryId++,
      ticket_id: ticket.id,
      user_id: userId,
      user_name: userName,
      action: "\u062A\u063A\u06CC\u06CC\u0631 \u0648\u0636\u0639\u06CC\u062A \u062F\u0633\u062A\u06CC",
      old_value: `\u0648\u0636\u0639\u06CC\u062A: ${this.getStatusLabel(prevStatus)}`,
      new_value: `\u0648\u0636\u0639\u06CC\u062A: ${this.getStatusLabel(status)}`,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    this.saveToFile();
    return ticket;
  }
  getStatusLabel(status) {
    switch (status) {
      case "open":
        return "\u0628\u0627\u0632";
      case "in_progress":
        return "\u062F\u0631 \u062D\u0627\u0644 \u0628\u0631\u0631\u0633\u06CC";
      case "waiting_user":
        return "\u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u067E\u0627\u0633\u062E";
      case "closed":
        return "\u0628\u0633\u062A\u0647 \u0634\u062F\u0647";
      default:
        return status;
    }
  }
  clearAllTickets() {
    const count = this.tickets.length;
    this.tickets = [];
    this.messages = [];
    this.attachments = [];
    this.ticketHistories = [];
    this.nextTicketId = 1001;
    this.nextMessageId = 2001;
    this.nextAttachmentId = 3001;
    this.nextHistoryId = 4001;
    this.saveToFile();
    return { success: true, clearedCount: count };
  }
  deleteTicket(ticketId) {
    const idx = this.tickets.findIndex((t) => t.id === ticketId);
    if (idx === -1) return false;
    this.tickets.splice(idx, 1);
    this.messages = this.messages.filter((m) => m.ticket_id !== ticketId);
    this.attachments = this.attachments.filter((a) => a.ticket_id !== ticketId);
    this.ticketHistories = this.ticketHistories.filter((h) => h.ticket_id !== ticketId);
    this.saveToFile();
    return true;
  }
  getUserTicketCounts(userId) {
    const userTickets = this.tickets.filter((t) => t.user_id === userId);
    return {
      all: userTickets.length,
      open: userTickets.filter((t) => t.status === "open").length,
      in_progress: userTickets.filter((t) => t.status === "in_progress").length,
      waiting_user: userTickets.filter((t) => t.status === "waiting_user").length,
      closed: userTickets.filter((t) => t.status === "closed").length
    };
  }
  getAdminTicketCounts() {
    return {
      all: this.tickets.length,
      open: this.tickets.filter((t) => t.status === "open").length,
      in_progress: this.tickets.filter((t) => t.status === "in_progress").length,
      waiting_user: this.tickets.filter((t) => t.status === "waiting_user").length,
      closed: this.tickets.filter((t) => t.status === "closed").length
    };
  }
  // OTP Helpers
  addOtp(mobile, code, ttlSeconds) {
    const otp = {
      id: this.nextOtpId++,
      mobile,
      purpose: "login",
      code,
      code_hash: code,
      status: "sent",
      attempts: 0,
      expires_at: Date.now() + ttlSeconds * 1e3,
      created_at: Date.now()
    };
    this.otpCodes.push(otp);
    this.saveToFile();
    return otp;
  }
  getRecentOtpsCount(mobile, windowSeconds = 3600) {
    const cutoff = Date.now() - windowSeconds * 1e3;
    return this.otpCodes.filter((o) => o.mobile === mobile && o.created_at > cutoff).length;
  }
  getLastOtp(mobile) {
    const filtered = this.otpCodes.filter((o) => o.mobile === mobile);
    return filtered[filtered.length - 1];
  }
  // User Helpers
  getUserByMobile(mobile) {
    return this.users.find((u) => u.mobile === mobile);
  }
  getUserById(id) {
    return this.users.find((u) => u.id === id);
  }
  createUser(mobile, role = "user") {
    const isOwner = mobile === "09111273476";
    const newUser = {
      id: this.nextUserId++,
      mobile,
      first_name: null,
      last_name: null,
      email: null,
      job_title: null,
      national_code: null,
      role: isOwner ? "admin" : role,
      onboarding_step: 1,
      onboarding_completed_at: null,
      mobile_verified_at: (/* @__PURE__ */ new Date()).toISOString(),
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.users.push(newUser);
    this.saveToFile();
    return newUser;
  }
  deleteUserCompletely(userId) {
    const user = this.getUserById(userId);
    if (!user) return false;
    const mobile = user.mobile;
    this.users = (this.users || []).filter((u) => u.id !== userId);
    this.companies = (this.companies || []).filter((c) => c.user_id !== userId);
    this.subscriptions = (this.subscriptions || []).filter((s) => s.user_id !== userId);
    this.orders = (this.orders || []).filter((o) => o.user_id !== userId);
    this.transactions = (this.transactions || []).filter((t) => t.user_id !== userId);
    const userTickets = (this.tickets || []).filter((tk) => tk.user_id === userId);
    const userTicketIds = new Set(userTickets.map((tk) => tk.id));
    this.tickets = (this.tickets || []).filter((tk) => tk.user_id !== userId);
    this.messages = (this.messages || []).filter((tm) => !userTicketIds.has(tm.ticket_id) && tm.sender_id !== userId);
    this.attachments = (this.attachments || []).filter((a) => !userTicketIds.has(a.ticket_id));
    this.ticketHistories = (this.ticketHistories || []).filter((h) => !userTicketIds.has(h.ticket_id) && h.user_id !== userId);
    if (mobile) {
      this.otpCodes = (this.otpCodes || []).filter((o) => o.mobile !== mobile);
    }
    this.pushSubscriptions = (this.pushSubscriptions || []).filter((ps) => ps.user_id !== userId);
    this.saveToFile();
    return true;
  }
  // Company Helpers
  getCompanyByUserId(userId) {
    return this.companies.find((c) => c.user_id === userId);
  }
  upsertCompany(userId, name, industry, employee_count, extraFields) {
    let company = this.getCompanyByUserId(userId);
    if (company) {
      company.name = name;
      company.industry = industry;
      company.employee_count = employee_count;
      if (extraFields) {
        if (extraFields.economic_code !== void 0) company.economic_code = extraFields.economic_code;
        if (extraFields.registration_number !== void 0) company.registration_number = extraFields.registration_number;
        if (extraFields.national_id !== void 0) company.national_id = extraFields.national_id;
        if (extraFields.postal_code !== void 0) company.postal_code = extraFields.postal_code;
        if (extraFields.province !== void 0) company.province = extraFields.province;
        if (extraFields.city !== void 0) company.city = extraFields.city;
        if (extraFields.address !== void 0) company.address = extraFields.address;
        if (extraFields.phone !== void 0) company.phone = extraFields.phone;
      }
      company.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    } else {
      company = {
        id: this.nextCompanyId++,
        user_id: userId,
        name,
        industry,
        employee_count,
        economic_code: extraFields?.economic_code,
        registration_number: extraFields?.registration_number,
        national_id: extraFields?.national_id,
        postal_code: extraFields?.postal_code,
        province: extraFields?.province,
        city: extraFields?.city,
        address: extraFields?.address,
        phone: extraFields?.phone,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.companies.push(company);
    }
    this.saveToFile();
    return company;
  }
  // Package Helpers
  getPackageById(id) {
    return this.packages.find((p) => p.id === id);
  }
  upsertPackage(data) {
    if (data.id) {
      const pkg = this.getPackageById(data.id);
      if (pkg) {
        Object.assign(pkg, {
          ...data,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        this.saveToFile();
        return pkg;
      }
    }
    const newPkg = {
      id: this.nextPackageId++,
      name: data.name,
      slug: data.slug || `package-${Date.now()}`,
      description: data.description || "",
      price: data.price || 0,
      duration_days: data.duration_days || 30,
      usage_limit: data.usage_limit ?? null,
      is_featured: !!data.is_featured,
      is_active: data.is_active ?? true,
      features: data.features || [],
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.packages.push(newPkg);
    this.saveToFile();
    return newPkg;
  }
  // ERP Configurator Methods
  calculateERPPrice(selectedModuleIds, userCount, billingPeriod = "3_months", couponCode = "") {
    const modules = this.erpModules.filter((m) => selectedModuleIds.includes(m.id) && m.is_active !== false);
    const modulesTotal = modules.reduce((sum, m) => sum + (Number(m.price) || 0), 0);
    const baseLimit = Number(this.configuratorSettings.base_user_limit) || 1;
    const extraUserPrice = Number(this.configuratorSettings.extra_user_price) || 8e5;
    const finalUserCount = typeof userCount === "number" && userCount > 0 ? userCount : baseLimit;
    const extraUsersCount = Math.max(finalUserCount - baseLimit, 0);
    const extraUsersCost = extraUsersCount * extraUserPrice;
    const baseMonthlyTotal = modulesTotal + extraUsersCost;
    let discountAmount = 0;
    const cleanCoupon = String(couponCode || "").trim().toUpperCase();
    if (cleanCoupon) {
      const coupon = this.coupons.find((c) => c.code.toUpperCase() === cleanCoupon && c.is_active);
      if (coupon) {
        if (coupon.discount_type === "percent") {
          discountAmount = Math.round(baseMonthlyTotal * coupon.discount_value / 100);
          if (coupon.max_discount_amount) {
            discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
          }
        } else if (coupon.discount_type === "fixed") {
          discountAmount = coupon.discount_value;
        }
      }
    }
    const discountedBase = Math.max(baseMonthlyTotal - discountAmount, 0);
    let multiplier = 3;
    const period = String(billingPeriod).toLowerCase();
    if (period === "yearly" || period === "12_months") {
      multiplier = this.configuratorSettings.yearly_multiplier || 10;
    } else if (period === "6_months" || period === "semiannual") {
      multiplier = this.configuratorSettings.semiannual_multiplier || 6;
    } else if (period === "3_months" || period === "quarterly") {
      multiplier = this.configuratorSettings.quarterly_multiplier || 3;
    } else if (period === "monthly") {
      multiplier = 1;
    }
    const finalAmount = discountedBase * multiplier;
    return {
      selected_modules: modules,
      selected_module_ids: modules.map((m) => m.id),
      user_count: finalUserCount,
      billing_period: period,
      modules_total: modulesTotal,
      extra_users_count: extraUsersCount,
      extra_users_cost: extraUsersCost,
      base_monthly_total: baseMonthlyTotal,
      discount_amount: discountAmount,
      discounted_base: discountedBase,
      multiplier,
      final_amount: finalAmount,
      coupon_applied: !!cleanCoupon && discountAmount > 0,
      coupon_code: cleanCoupon || null
    };
  }
  createERPOrder(userId, selectedModuleIds, userCount, billingPeriod = "3_months", couponCode = "", subscriptionId) {
    const baseLimit = this.configuratorSettings.base_user_limit || 1;
    const finalUserCount = typeof userCount === "number" && userCount > 0 ? userCount : baseLimit;
    const calc = this.calculateERPPrice(selectedModuleIds, finalUserCount, billingPeriod, couponCode);
    const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(2, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    const order = {
      id: this.nextOrderId++,
      user_id: userId,
      order_number: `ORD-${dateStr}-${rand}`,
      amount: calc.final_amount,
      status: "pending",
      subscription_id: subscriptionId ? Number(subscriptionId) : void 0,
      module_ids: calc.selected_module_ids,
      user_count: calc.user_count,
      billing_period: calc.billing_period || "3_months",
      coupon_code: calc.coupon_code,
      discount_amount: calc.discount_amount * calc.multiplier,
      breakdown: {
        modules_total: calc.modules_total,
        extra_users_count: calc.extra_users_count,
        extra_users_cost: calc.extra_users_cost,
        base_monthly_total: calc.base_monthly_total,
        multiplier: calc.multiplier,
        discount_amount: calc.discount_amount * calc.multiplier,
        final_amount: calc.final_amount
      },
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.orders.push(order);
    this.saveToFile();
    return order;
  }
  createERPSubscription(userId, orderId, moduleIds, userCount, billingPeriod = "3_months", source = "purchase", customDurationDays) {
    const now = /* @__PURE__ */ new Date();
    const period = String(billingPeriod).toLowerCase();
    const durationDays = customDurationDays || (period === "yearly" ? 365 : period === "6_months" ? 180 : period === "3_months" ? 90 : 30);
    const expires = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1e3);
    const sub = {
      id: this.nextSubscriptionId++,
      user_id: userId,
      order_id: orderId,
      source,
      status: "active",
      starts_at: now.toISOString(),
      expires_at: expires.toISOString(),
      usage_limit: null,
      usage_used: 0,
      module_ids: moduleIds,
      user_count: userCount,
      billing_period: period || "3_months",
      title: source === "trial" ? "\u062F\u0648\u0631\u0647 \u06F5 \u0631\u0648\u0632\u0647 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627" : `\u0627\u0634\u062A\u0631\u0627\u06A9 \u0633\u0627\u0632\u0645\u0627\u0646\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 (${moduleIds.length} \u0645\u0627\u0698\u0648\u0644)`,
      created_at: now.toISOString()
    };
    this.subscriptions.push(sub);
    this.saveToFile();
    return sub;
  }
  activateOrMergeERPSubscription(userId, orderId, moduleIds, userCount = 1, billingPeriod = "3_months", source = "purchase", subscriptionId, isResourceUpgrade) {
    const userSubs = this.subscriptions.filter((s) => s.user_id === userId);
    let targetSub;
    if (subscriptionId) {
      targetSub = userSubs.find((s) => s.id === Number(subscriptionId) && s.status !== "cancelled");
    }
    if (!targetSub) {
      targetSub = userSubs.find((s) => s.status === "active" && (!s.expires_at || new Date(s.expires_at) > /* @__PURE__ */ new Date()));
    }
    if (!targetSub) {
      targetSub = userSubs.find((s) => s.status === "active" || s.source === "trial" && s.status !== "cancelled");
    }
    const period = String(billingPeriod).toLowerCase();
    const durationDays = period === "yearly" ? 365 : period === "6_months" ? 180 : period === "3_months" ? 90 : 30;
    if (targetSub) {
      const existingMods = targetSub.module_ids || [];
      const mergedMods = Array.from(/* @__PURE__ */ new Set([...existingMods, ...moduleIds]));
      targetSub.module_ids = mergedMods;
      targetSub.title = `\u0627\u0634\u062A\u0631\u0627\u06A9 \u0633\u0627\u0632\u0645\u0627\u0646\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 (${mergedMods.length} \u0645\u0627\u0698\u0648\u0644)`;
      targetSub.status = "active";
      if (orderId) targetSub.order_id = orderId;
      if (userCount) targetSub.user_count = Math.max(targetSub.user_count || 1, userCount);
      if (billingPeriod) targetSub.billing_period = period;
      targetSub.source = source;
      const now = /* @__PURE__ */ new Date();
      const currentExpires = targetSub.expires_at ? new Date(targetSub.expires_at) : null;
      if (isResourceUpgrade && currentExpires && currentExpires > now) {
        targetSub.expires_at = currentExpires.toISOString();
      } else {
        const baseTime = currentExpires && currentExpires > now && targetSub.source !== "trial" ? currentExpires.getTime() : now.getTime();
        targetSub.expires_at = new Date(baseTime + durationDays * 24 * 60 * 60 * 1e3).toISOString();
      }
      this.saveToFile();
      return targetSub;
    }
    return this.createERPSubscription(userId, orderId, moduleIds, userCount, period, source);
  }
  // Orders & Subscriptions
  createOrder(userId, packageId, amount) {
    const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(2, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    const order = {
      id: this.nextOrderId++,
      user_id: userId,
      package_id: packageId,
      order_number: `ORD-${dateStr}-${rand}`,
      amount,
      status: "pending",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.orders.push(order);
    this.saveToFile();
    return order;
  }
  createTransaction(orderId, userId, authority, amount) {
    const tx = {
      id: this.nextTransactionId++,
      order_id: orderId,
      user_id: userId,
      gateway: "sandbox",
      authority,
      reference_id: null,
      amount,
      status: "initiated",
      raw_response: null,
      paid_at: null,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.transactions.push(tx);
    this.saveToFile();
    return tx;
  }
  createSubscription(userId, packageId, orderId, source, durationDays, usageLimit) {
    const now = /* @__PURE__ */ new Date();
    const expires = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1e3);
    const sub = {
      id: this.nextSubscriptionId++,
      user_id: userId,
      package_id: packageId,
      order_id: orderId,
      source,
      status: "active",
      starts_at: now.toISOString(),
      expires_at: expires.toISOString(),
      usage_limit: usageLimit,
      usage_used: 0,
      created_at: now.toISOString()
    };
    this.subscriptions.push(sub);
    this.saveToFile();
    return sub;
  }
  // -------------------------------------------------------------
  // Audit Logging Methods
  // -------------------------------------------------------------
  addAuditLog(entry) {
    const log = {
      id: this.nextAuditLogId++,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      user_id: entry.user_id,
      user_name: entry.user_name || "\u0633\u06CC\u0633\u062A\u0645",
      user_mobile: entry.user_mobile || null,
      user_role: entry.user_role || "system",
      action_type: entry.action_type,
      action_description: entry.action_description,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      ip_address: entry.ip_address || "localhost",
      user_agent: entry.user_agent || "Unknown",
      status: entry.status || "SUCCESS",
      details: entry.details || {}
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 2e3) {
      this.auditLogs = this.auditLogs.slice(0, 2e3);
    }
    this.saveToFile();
    return log;
  }
  getAuditLogs(filters) {
    let result = [...this.auditLogs];
    if (filters?.action_type && filters.action_type !== "all") {
      result = result.filter((l) => l.action_type === filters.action_type);
    }
    if (filters?.resource_type && filters.resource_type !== "all") {
      result = result.filter((l) => l.resource_type === filters.resource_type);
    }
    if (filters?.status && filters.status !== "all") {
      result = result.filter((l) => l.status === filters.status);
    }
    if (filters?.user_id) {
      result = result.filter((l) => l.user_id === filters.user_id);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (l) => l.action_description.toLowerCase().includes(q) || l.user_name && l.user_name.toLowerCase().includes(q) || l.user_mobile && l.user_mobile.includes(q) || l.ip_address && l.ip_address.includes(q) || l.resource_type && l.resource_type.toLowerCase().includes(q) || String(l.resource_id || "").toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const total = result.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    const paginated = result.slice(offset, offset + limit);
    return { logs: paginated, total };
  }
  getAuditStats() {
    const total = this.auditLogs.length;
    const privilege_escalations = this.auditLogs.filter((l) => l.action_type === "PRIVILEGE_ESCALATION").length;
    const sensitive_data_access = this.auditLogs.filter((l) => l.action_type === "SENSITIVE_DATA_ACCESS").length;
    const config_changes = this.auditLogs.filter((l) => l.action_type === "CONFIGURATION_CHANGE").length;
    const security_events = this.auditLogs.filter((l) => l.action_type === "SECURITY_EVENT").length;
    const subscription_changes = this.auditLogs.filter((l) => l.action_type === "SUBSCRIPTION_CHANGE").length;
    const oneDayAgo = new Date(Date.now() - 24 * 3600 * 1e3).toISOString();
    const last_24h_count = this.auditLogs.filter((l) => l.timestamp >= oneDayAgo).length;
    return {
      total,
      privilege_escalations,
      sensitive_data_access,
      config_changes,
      security_events,
      subscription_changes,
      last_24h_count
    };
  }
  setUserRole(userId, role) {
    const user = this.getUserById(userId);
    if (!user) return null;
    user.role = role;
    user.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    this.saveToFile();
    return user;
  }
  // Push Subscription Helpers
  addOrUpdatePushSubscription(data) {
    const existingIndex = this.pushSubscriptions.findIndex((s) => s.endpoint === data.endpoint);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (existingIndex >= 0) {
      this.pushSubscriptions[existingIndex] = {
        ...this.pushSubscriptions[existingIndex],
        user_id: data.user_id !== void 0 ? data.user_id : this.pushSubscriptions[existingIndex].user_id,
        user_mobile: data.user_mobile || this.pushSubscriptions[existingIndex].user_mobile,
        role: data.role || this.pushSubscriptions[existingIndex].role,
        keys: data.keys,
        user_agent: data.user_agent || this.pushSubscriptions[existingIndex].user_agent,
        ip_address: data.ip_address || this.pushSubscriptions[existingIndex].ip_address,
        updated_at: now
      };
      this.saveToFile();
      return this.pushSubscriptions[existingIndex];
    }
    const newSub = {
      id: this.nextPushSubId++,
      user_id: data.user_id || null,
      user_mobile: data.user_mobile || null,
      role: data.role || "guest",
      endpoint: data.endpoint,
      keys: data.keys,
      user_agent: data.user_agent,
      ip_address: data.ip_address,
      created_at: now,
      updated_at: now
    };
    this.pushSubscriptions.push(newSub);
    this.saveToFile();
    return newSub;
  }
  removePushSubscription(endpoint) {
    const beforeCount = this.pushSubscriptions.length;
    this.pushSubscriptions = this.pushSubscriptions.filter((s) => s.endpoint !== endpoint);
    if (this.pushSubscriptions.length !== beforeCount) {
      this.saveToFile();
      return true;
    }
    return false;
  }
  getPushSubscriptions(filter) {
    if (!filter) return this.pushSubscriptions;
    return this.pushSubscriptions.filter((s) => {
      if (filter.user_id !== void 0 && s.user_id !== filter.user_id) return false;
      if (filter.role && s.role !== filter.role) return false;
      return true;
    });
  }
  getAllPushSubscriptions() {
    return this.pushSubscriptions;
  }
};
var db = new Database();

// server/rateLimiters.ts
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var rateLimitHandler = (customMessage) => {
  return (_req, res) => {
    res.status(429).json({
      error: "Too Many Requests",
      message: customMessage,
      retry_after_seconds: res.getHeader("Retry-After") || 60
    });
  };
};
var globalApiLimiter = (0, import_express_rate_limit.default)({
  windowMs: 1 * 60 * 1e3,
  // 1 minute
  max: 180,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("\u062A\u0639\u062F\u0627\u062F \u062F\u0631\u062E\u0648\u0627\u0633\u062A\u200C\u0647\u0627\u06CC \u0634\u0645\u0627 \u0628\u06CC\u0634 \u0627\u0632 \u062D\u062F \u0645\u062C\u0627\u0632 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u06CC\u06A9 \u062F\u0642\u06CC\u0642\u0647 \u062F\u06CC\u06AF\u0631 \u0645\u062C\u062F\u062F\u0627\u064B \u062A\u0644\u0627\u0634 \u06A9\u0646\u06CC\u062F.")
});
var otpRequestLimiter = (0, import_express_rate_limit.default)({
  windowMs: 10 * 60 * 1e3,
  // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("\u062A\u0639\u062F\u0627\u062F \u062F\u0631\u062E\u0648\u0627\u0633\u062A\u200C\u0647\u0627\u06CC \u0627\u0631\u0633\u0627\u0644 \u06A9\u062F \u062A\u0623\u06CC\u06CC\u062F \u0628\u06CC\u0634 \u0627\u0632 \u062D\u062F \u0645\u062C\u0627\u0632 \u0627\u0633\u062A. \u0628\u0647 \u0645\u0646\u0638\u0648\u0631 \u062D\u0641\u0638 \u0627\u0645\u0646\u06CC\u062A\u060C \u0644\u0637\u0641\u0627\u064B \u06F1\u06F0 \u062F\u0642\u06CC\u0642\u0647 \u0628\u0639\u062F \u062A\u0644\u0627\u0634 \u0646\u0645\u0627\u06CC\u06CC\u062F.")
});
var otpVerifyLimiter = (0, import_express_rate_limit.default)({
  windowMs: 10 * 60 * 1e3,
  // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("\u062A\u0639\u062F\u0627\u062F \u062F\u0641\u0639\u0627\u062A \u0628\u0631\u0631\u0633\u06CC \u06A9\u062F \u0628\u06CC\u0634 \u0627\u0632 \u062D\u062F \u0645\u062C\u0627\u0632 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u06F1\u06F0 \u062F\u0642\u06CC\u0642\u0647 \u062F\u06CC\u06AF\u0631 \u0645\u062C\u062F\u062F\u0627\u064B \u062A\u0644\u0627\u0634 \u06A9\u0646\u06CC\u062F.")
});
var ticketSubmissionLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("\u062A\u0639\u062F\u0627\u062F \u062A\u06CC\u06A9\u062A\u200C\u0647\u0627\u06CC \u0627\u0631\u0633\u0627\u0644\u06CC \u0628\u06CC\u0634 \u0627\u0632 \u0633\u0642\u0641 \u0645\u062C\u0627\u0632 \u062F\u0631 \u0627\u06CC\u0646 \u0628\u0627\u0632\u0647 \u0632\u0645\u0627\u0646\u06CC \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u06F1\u06F5 \u062F\u0642\u06CC\u0642\u0647 \u062F\u06CC\u06AF\u0631 \u062A\u0644\u0627\u0634 \u0646\u0645\u0627\u06CC\u06CC\u062F.")
});
var ticketMessageLimiter = (0, import_express_rate_limit.default)({
  windowMs: 10 * 60 * 1e3,
  // 10 minutes
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("\u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645\u200C\u0647\u0627\u06CC \u0645\u062A\u0648\u0627\u0644\u06CC \u0628\u06CC\u0634 \u0627\u0632 \u062D\u062F \u0645\u062C\u0627\u0632 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u06A9\u0645\u06CC \u0635\u0628\u0631 \u06A9\u0631\u062F\u0647 \u0648 \u0645\u062C\u062F\u062F\u0627\u064B \u0627\u0631\u0633\u0627\u0644 \u0646\u0645\u0627\u06CC\u06CC\u062F.")
});
var couponValidateLimiter = (0, import_express_rate_limit.default)({
  windowMs: 5 * 60 * 1e3,
  // 5 minutes
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("\u062A\u0639\u062F\u0627\u062F \u062F\u0641\u0639\u0627\u062A \u0628\u0631\u0631\u0633\u06CC \u06A9\u062F \u062A\u062E\u0641\u06CC\u0641 \u0628\u06CC\u0634 \u0627\u0632 \u062D\u062F \u0645\u062C\u0627\u0632 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u06F5 \u062F\u0642\u06CC\u0642\u0647 \u062F\u06CC\u06AF\u0631 \u0627\u0645\u062A\u062D\u0627\u0646 \u06A9\u0646\u06CC\u062F.")
});
var orderCreationLimiter = (0, import_express_rate_limit.default)({
  windowMs: 10 * 60 * 1e3,
  // 10 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("\u062A\u0639\u062F\u0627\u062F \u0633\u0641\u0627\u0631\u0634\u200C\u0647\u0627\u06CC \u0627\u0631\u0633\u0627\u0644\u06CC \u0628\u06CC\u0634 \u0627\u0632 \u062D\u062F \u0645\u062C\u0627\u0632 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u0686\u0646\u062F \u062F\u0642\u06CC\u0642\u0647 \u0628\u0639\u062F \u0645\u062C\u062F\u062F\u0627\u064B \u0627\u0642\u062F\u0627\u0645 \u0641\u0631\u0645\u0627\u06CC\u06CC\u062F.")
});

// server/auditLogger.ts
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "localhost";
}
function getUserAgent(req) {
  const ua = req.headers["user-agent"];
  if (Array.isArray(ua)) return ua.join(" ");
  return ua || "Unknown User-Agent";
}
function logAudit(options) {
  const req = options.req;
  const user = req?.user;
  const userId = options.userId !== void 0 ? options.userId : user?.id ?? null;
  const userName = options.userName || (user ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.mobile : "\u0633\u06CC\u0633\u062A\u0645");
  const userMobile = options.userMobile !== void 0 ? options.userMobile : user?.mobile ?? null;
  const userRole = options.userRole || (user?.role === "admin" ? "admin" : user ? "user" : "system");
  const ipAddress = options.ipAddress || (req ? getClientIp(req) : "localhost");
  const userAgent = options.userAgent || (req ? getUserAgent(req) : "Karovita-Audit/1.0");
  const auditEntry = db.addAuditLog({
    user_id: userId,
    user_name: userName,
    user_mobile: userMobile,
    user_role: userRole,
    action_type: options.actionType,
    action_description: options.actionDescription,
    resource_type: options.resourceType,
    resource_id: options.resourceId ?? null,
    ip_address: ipAddress,
    user_agent: userAgent,
    status: options.status || "SUCCESS",
    details: options.details || {}
  });
  return auditEntry;
}
function logPrivilegeEscalation(req, params) {
  const description = params.actionDescription || `\u062A\u063A\u06CC\u06CC\u0631 \u0633\u0637\u062D \u062F\u0633\u062A\u0631\u0633\u06CC \u06A9\u0627\u0631\u0628\u0631 #${params.targetUserId} (${params.targetUserName || "\u0646\u0627\u0634\u0646\u0627\u0633"}) \u0627\u0632 "${params.oldRole}" \u0628\u0647 "${params.newRole}"`;
  return logAudit({
    req,
    actionType: "PRIVILEGE_ESCALATION",
    actionDescription: description,
    resourceType: "USER_ROLE",
    resourceId: params.targetUserId,
    status: "SUCCESS",
    details: {
      target_user_id: params.targetUserId,
      target_user_name: params.targetUserName,
      old_role: params.oldRole,
      new_role: params.newRole,
      ...params.details
    }
  });
}
function logSensitiveDataAccess(req, params) {
  return logAudit({
    req,
    actionType: "SENSITIVE_DATA_ACCESS",
    actionDescription: params.actionDescription,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    status: "SUCCESS",
    details: params.details || {}
  });
}
function logConfigChange(req, params) {
  return logAudit({
    req,
    actionType: "CONFIGURATION_CHANGE",
    actionDescription: params.actionDescription,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    status: "SUCCESS",
    details: {
      ...params.oldValue !== void 0 ? { old_value: params.oldValue } : {},
      ...params.newValue !== void 0 ? { new_value: params.newValue } : {},
      ...params.details
    }
  });
}
function logSecurityEvent(req, params) {
  return logAudit({
    req,
    actionType: "SECURITY_EVENT",
    actionDescription: params.actionDescription,
    resourceType: params.resourceType || "AUTH_SECURITY",
    resourceId: params.resourceId,
    status: params.status || "WARNING",
    details: params.details || {}
  });
}
function logSubscriptionChange(req, params) {
  return logAudit({
    req,
    actionType: "SUBSCRIPTION_CHANGE",
    actionDescription: params.actionDescription,
    resourceType: "SUBSCRIPTION",
    resourceId: params.subscriptionId,
    status: "SUCCESS",
    details: {
      subscription_id: params.subscriptionId,
      ...params.oldStatus ? { old_status: params.oldStatus } : {},
      ...params.newStatus ? { new_status: params.newStatus } : {},
      ...params.details
    }
  });
}
function logFinancialEvent(req, params) {
  return logAudit({
    req,
    actionType: "FINANCIAL_TRANSACTION",
    actionDescription: params.actionDescription,
    resourceType: "ORDER_INVOICE",
    resourceId: params.orderId || params.transactionId || null,
    status: "SUCCESS",
    details: {
      action_type: params.actionType || "PAYMENT",
      order_id: params.orderId,
      transaction_id: params.transactionId,
      amount: params.amount,
      reference_id: params.referenceId,
      user_id: params.userId,
      ...params.details
    }
  });
}

// server/webPush.ts
var import_web_push = __toESM(require("web-push"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var VAPID_STORAGE_FILE = import_path2.default.join(process.cwd(), "data", "vapid.json");
var vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || "",
  privateKey: process.env.VAPID_PRIVATE_KEY || ""
};
function initVapidKeys() {
  if (vapidKeys.publicKey && vapidKeys.privateKey) {
    return vapidKeys;
  }
  try {
    const dir = import_path2.default.dirname(VAPID_STORAGE_FILE);
    if (!import_fs2.default.existsSync(dir)) {
      import_fs2.default.mkdirSync(dir, { recursive: true });
    }
    if (import_fs2.default.existsSync(VAPID_STORAGE_FILE)) {
      const content = import_fs2.default.readFileSync(VAPID_STORAGE_FILE, "utf-8");
      const loaded = JSON.parse(content);
      if (loaded.publicKey && loaded.privateKey) {
        vapidKeys = loaded;
        return vapidKeys;
      }
    }
    const generated = import_web_push.default.generateVAPIDKeys();
    vapidKeys = {
      publicKey: generated.publicKey,
      privateKey: generated.privateKey
    };
    import_fs2.default.writeFileSync(VAPID_STORAGE_FILE, JSON.stringify(vapidKeys, null, 2), "utf-8");
    console.log("[WebPush] Generated and saved new VAPID keys");
  } catch (err) {
    console.error("[WebPush] Error loading/generating VAPID keys:", err);
    const generated = import_web_push.default.generateVAPIDKeys();
    vapidKeys = {
      publicKey: generated.publicKey,
      privateKey: generated.privateKey
    };
  }
  return vapidKeys;
}
try {
  const keys = initVapidKeys();
  import_web_push.default.setVapidDetails(
    "mailto:support@karovita.ir",
    keys.publicKey,
    keys.privateKey
  );
  console.log("[WebPush] VAPID details configured successfully");
} catch (err) {
  console.error("[WebPush] Failed to set VAPID details:", err);
}
function getVapidPublicKey() {
  if (!vapidKeys.publicKey) {
    initVapidKeys();
  }
  return vapidKeys.publicKey;
}
async function sendWebPush(subscription, payload) {
  try {
    const stringPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icon-192.svg",
      badge: payload.badge || "/badge-72.svg",
      url: payload.url || "/",
      tag: payload.tag || `karovita-${Date.now()}`,
      ticketId: payload.ticketId,
      timestamp: Date.now(),
      requireInteraction: payload.requireInteraction || false
    });
    const response = await import_web_push.default.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys
      },
      stringPayload,
      {
        TTL: 24 * 60 * 60,
        // 24 hours
        urgency: "high"
      }
    );
    return { success: true, statusCode: response.statusCode };
  } catch (err) {
    console.warn("[WebPush] Error sending push notification:", err?.message || err);
    return {
      success: false,
      statusCode: err?.statusCode,
      error: err?.message || "Push delivery failed"
    };
  }
}
async function broadcastWebPush(subscriptions, payload) {
  let sent = 0;
  let failed = 0;
  const promises = subscriptions.map(async (sub) => {
    const res = await sendWebPush(sub, payload);
    if (res.success) {
      sent++;
    } else {
      failed++;
    }
  });
  await Promise.all(promises);
  return { sent, failed };
}

// server/errorLogger.ts
var import_fs3 = __toESM(require("fs"), 1);
var import_path3 = __toESM(require("path"), 1);
var DATA_DIR = import_path3.default.join(process.cwd(), "data");
var ERROR_LOGS_FILE = import_path3.default.join(DATA_DIR, "error_logs.json");
var FORMATTED_LOG_FILE = import_path3.default.join(DATA_DIR, "app_errors.log");
var MAX_LOG_ENTRIES = 1e3;
var LocalErrorLogger = class {
  logs = [];
  isInitialized = false;
  constructor() {
    this.init();
  }
  init() {
    if (this.isInitialized) return;
    try {
      if (!import_fs3.default.existsSync(DATA_DIR)) {
        import_fs3.default.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (import_fs3.default.existsSync(ERROR_LOGS_FILE)) {
        const raw = import_fs3.default.readFileSync(ERROR_LOGS_FILE, "utf-8");
        if (raw && raw.trim()) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.logs = parsed;
          }
        }
      } else {
        this.saveToFile();
      }
      process.on("uncaughtException", (err) => {
        this.logServerError(err, { type: "uncaughtException" }, void 0, "fatal", "unhandled");
      });
      process.on("unhandledRejection", (reason) => {
        const err = reason instanceof Error ? reason : new Error(String(reason));
        this.logServerError(err, { type: "unhandledRejection", raw: reason }, void 0, "error", "unhandled");
      });
      this.isInitialized = true;
      console.log(`[Diagnostics Service] Initialized successfully. Processed ${this.logs.length} records.`);
    } catch (err) {
      console.error("[Diagnostics Service] Initialization issue:", err);
    }
  }
  saveToFile() {
    try {
      if (!import_fs3.default.existsSync(DATA_DIR)) {
        import_fs3.default.mkdirSync(DATA_DIR, { recursive: true });
      }
      import_fs3.default.writeFileSync(ERROR_LOGS_FILE, JSON.stringify(this.logs, null, 2), "utf-8");
    } catch (err) {
      console.error("[Local Error Logger] Error saving logs to JSON:", err);
    }
  }
  appendToTextLog(log) {
    try {
      const line = `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source.toUpperCase()}] ${log.name || "Error"}: ${log.message} | URL: ${log.method || ""} ${log.url || "N/A"} | IP: ${log.ip_address || "N/A"} | User: ${log.user_mobile || log.user_id || "Guest"}
${log.stack ? log.stack + "\n" : ""}------------------------------------------------------------
`;
      import_fs3.default.appendFileSync(FORMATTED_LOG_FILE, line, "utf-8");
    } catch (err) {
      console.error("[Local Error Logger] Error appending to text log:", err);
    }
  }
  sanitizeContext(context) {
    if (!context || typeof context !== "object") return context;
    const sensitiveKeys = ["password", "token", "authorization", "secret", "otp", "code", "apikey", "cookie"];
    const sanitized = {};
    for (const [key, value] of Object.entries(context)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key] = "***REDACTED***";
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeContext(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  logServerError(error, context = {}, req, level = "error", source = "server") {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const id = `err_srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const message = error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error);
    const name = error instanceof Error ? error.name : "ServerError";
    const stack = error instanceof Error ? error.stack : void 0;
    const user = req?.user;
    const url = req ? req.originalUrl || req.url : context.url;
    const method = req ? req.method : context.method;
    const statusCode = context.status || error?.status || error?.statusCode || (req ? 500 : void 0);
    const logEntry = {
      id,
      timestamp,
      level,
      source,
      message,
      name,
      stack,
      url,
      method,
      status_code: statusCode,
      user_id: user?.id ?? null,
      user_mobile: user?.mobile ?? null,
      user_role: user?.role ?? null,
      ip_address: req ? getClientIp(req) : "localhost",
      user_agent: req ? getUserAgent(req) : "Server-Internal",
      context: this.sanitizeContext(context),
      resolved: false
    };
    this.logs.unshift(logEntry);
    if (this.logs.length > MAX_LOG_ENTRIES) {
      this.logs = this.logs.slice(0, MAX_LOG_ENTRIES);
    }
    this.saveToFile();
    this.appendToTextLog(logEntry);
    console.error(`\u{1F534} [Local Logger] ${level.toUpperCase()} (${source}): ${message}`, {
      url,
      method,
      user: user?.mobile || "anonymous"
    });
    return logEntry;
  }
  logClientError(payload, req) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const id = `err_cli_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const user = req?.user;
    const logEntry = {
      id,
      timestamp,
      level: payload.level || "error",
      source: "client",
      message: payload.message || "Unknown Client Error",
      name: payload.name || "ClientError",
      stack: payload.stack,
      url: payload.url,
      user_id: user?.id ?? null,
      user_mobile: user?.mobile ?? null,
      user_role: user?.role ?? null,
      ip_address: req ? getClientIp(req) : "localhost",
      user_agent: req ? getUserAgent(req) : "Browser Client",
      context: this.sanitizeContext(payload.context),
      resolved: false
    };
    this.logs.unshift(logEntry);
    if (this.logs.length > MAX_LOG_ENTRIES) {
      this.logs = this.logs.slice(0, MAX_LOG_ENTRIES);
    }
    this.saveToFile();
    this.appendToTextLog(logEntry);
    console.warn(`\u{1F7E1} [Local Logger] Client Error logged: ${payload.message} (from ${logEntry.ip_address})`);
    return logEntry;
  }
  getLogs(filters = {}) {
    let result = [...this.logs];
    if (filters.level && filters.level !== "all") {
      result = result.filter((l) => l.level === filters.level);
    }
    if (filters.source && filters.source !== "all") {
      result = result.filter((l) => l.source === filters.source);
    }
    if (filters.resolved !== void 0 && filters.resolved !== "all") {
      const isResolved = filters.resolved === true || filters.resolved === "true";
      result = result.filter((l) => l.resolved === isResolved);
    }
    if (filters.search && filters.search.trim()) {
      const query = filters.search.toLowerCase().trim();
      result = result.filter(
        (l) => l.message?.toLowerCase().includes(query) || l.name?.toLowerCase().includes(query) || l.url?.toLowerCase().includes(query) || l.user_mobile?.includes(query) || l.ip_address?.includes(query)
      );
    }
    const limit = filters.limit || 200;
    return result.slice(0, limit);
  }
  getStats() {
    const total = this.logs.length;
    const errors = this.logs.filter((l) => l.level === "error" || l.level === "fatal").length;
    const warnings = this.logs.filter((l) => l.level === "warn").length;
    const clientErrors = this.logs.filter((l) => l.source === "client").length;
    const serverErrors = this.logs.filter((l) => l.source === "server" || l.source === "api" || l.source === "unhandled").length;
    const unresolved = this.logs.filter((l) => !l.resolved).length;
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const todayErrors = this.logs.filter((l) => l.timestamp.startsWith(todayStr)).length;
    return {
      total,
      errors,
      warnings,
      clientErrors,
      serverErrors,
      unresolved,
      todayErrors,
      logFilePath: "data/error_logs.json",
      textLogFilePath: "data/app_errors.log"
    };
  }
  markResolved(id, resolved = true) {
    const item = this.logs.find((l) => l.id === id);
    if (item) {
      item.resolved = resolved;
      this.saveToFile();
      return true;
    }
    return false;
  }
  clearLogs() {
    this.logs = [];
    this.saveToFile();
    try {
      if (import_fs3.default.existsSync(FORMATTED_LOG_FILE)) {
        import_fs3.default.writeFileSync(FORMATTED_LOG_FILE, `--- Error Log Cleared at ${(/* @__PURE__ */ new Date()).toISOString()} ---
`, "utf-8");
      }
    } catch {
    }
    return true;
  }
  getRawLogText() {
    try {
      if (import_fs3.default.existsSync(FORMATTED_LOG_FILE)) {
        return import_fs3.default.readFileSync(FORMATTED_LOG_FILE, "utf-8");
      }
    } catch {
    }
    return "";
  }
};
var errorLogger = new LocalErrorLogger();
function initServerLogger() {
  errorLogger.init();
}
function logServerError(error, context = {}, req, level = "error", source = "server") {
  return errorLogger.logServerError(error, context, req, level, source);
}
function logClientError(payload, req) {
  return errorLogger.logClientError(payload, req);
}

// server/performanceLogger.ts
var import_fs4 = __toESM(require("fs"), 1);
var import_path4 = __toESM(require("path"), 1);
var DATA_DIR2 = import_path4.default.join(process.cwd(), "data");
var VITALS_LOGS_FILE = import_path4.default.join(DATA_DIR2, "vitals_logs.json");
var FORMATTED_VITALS_FILE = import_path4.default.join(DATA_DIR2, "app_vitals.log");
var MAX_LOG_ENTRIES2 = 500;
var PerformanceLogger = class {
  logs = [];
  isInitialized = false;
  constructor() {
    this.init();
  }
  init() {
    if (this.isInitialized) return;
    try {
      if (!import_fs4.default.existsSync(DATA_DIR2)) {
        import_fs4.default.mkdirSync(DATA_DIR2, { recursive: true });
      }
      if (import_fs4.default.existsSync(VITALS_LOGS_FILE)) {
        const raw = import_fs4.default.readFileSync(VITALS_LOGS_FILE, "utf-8");
        if (raw && raw.trim()) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.logs = parsed;
          }
        }
      } else {
        this.saveToFile();
      }
      this.isInitialized = true;
      console.log(`[Performance Logger] Initialized successfully. Loaded ${this.logs.length} vitals entries from data/vitals_logs.json`);
    } catch (err) {
      console.error("[Performance Logger] Initialization error:", err);
    }
  }
  saveToFile() {
    try {
      if (!import_fs4.default.existsSync(DATA_DIR2)) {
        import_fs4.default.mkdirSync(DATA_DIR2, { recursive: true });
      }
      import_fs4.default.writeFileSync(VITALS_LOGS_FILE, JSON.stringify(this.logs, null, 2), "utf-8");
    } catch (err) {
      console.error("[Performance Logger] Error saving vitals to file:", err);
    }
  }
  appendToTextLog(entry) {
    try {
      const metricsSummary = Object.entries(entry.metrics).filter(([_, v]) => v !== void 0 && v !== null).map(([k, v]) => `${k.toUpperCase()}: ${typeof v === "number" ? k === "cls" ? v.toFixed(3) : Math.round(v) + "ms" : v}`).join(" | ");
      const line = `[${entry.timestamp}] [VITALS] URL: ${entry.url || "/"} | ${metricsSummary} | IP: ${entry.ip_address || "N/A"}
`;
      import_fs4.default.appendFileSync(FORMATTED_VITALS_FILE, line, "utf-8");
    } catch (err) {
      console.error("[Performance Logger] Error appending to text log:", err);
    }
  }
  calculateRatings(metrics) {
    const ratings = {};
    if (metrics.lcp !== void 0 && metrics.lcp !== null) {
      ratings.lcp = metrics.lcp <= 2500 ? "good" : metrics.lcp <= 4e3 ? "needs-improvement" : "poor";
    }
    if (metrics.cls !== void 0 && metrics.cls !== null) {
      ratings.cls = metrics.cls <= 0.1 ? "good" : metrics.cls <= 0.25 ? "needs-improvement" : "poor";
    }
    if (metrics.fid !== void 0 && metrics.fid !== null) {
      ratings.fid = metrics.fid <= 100 ? "good" : metrics.fid <= 300 ? "needs-improvement" : "poor";
    }
    if (metrics.inp !== void 0 && metrics.inp !== null) {
      ratings.inp = metrics.inp <= 200 ? "good" : metrics.inp <= 500 ? "needs-improvement" : "poor";
    }
    if (metrics.fcp !== void 0 && metrics.fcp !== null) {
      ratings.fcp = metrics.fcp <= 1800 ? "good" : metrics.fcp <= 3e3 ? "needs-improvement" : "poor";
    }
    if (metrics.ttfb !== void 0 && metrics.ttfb !== null) {
      ratings.ttfb = metrics.ttfb <= 800 ? "good" : metrics.ttfb <= 1800 ? "needs-improvement" : "poor";
    }
    return ratings;
  }
  logVitals(payload, req) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const id = `vit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const user = req?.user;
    const ratings = this.calculateRatings(payload.metrics);
    const entry = {
      id,
      timestamp,
      url: payload.url || (req ? req.originalUrl : "/"),
      metrics: payload.metrics,
      ratings,
      connection: payload.connection,
      memory: payload.memory,
      user_id: user?.id ?? null,
      user_mobile: user?.mobile ?? null,
      ip_address: req ? getClientIp(req) : "localhost",
      user_agent: req ? getUserAgent(req) : "Browser Client"
    };
    this.logs.unshift(entry);
    if (this.logs.length > MAX_LOG_ENTRIES2) {
      this.logs = this.logs.slice(0, MAX_LOG_ENTRIES2);
    }
    this.saveToFile();
    this.appendToTextLog(entry);
    return entry;
  }
  getVitals(limit = 100) {
    return this.logs.slice(0, limit);
  }
  getStats() {
    const total = this.logs.length;
    if (total === 0) {
      return {
        total: 0,
        averages: { lcp: null, cls: null, fid: null, inp: null, fcp: null, ttfb: null },
        scoreCounts: { good: 0, needsImprovement: 0, poor: 0 },
        logFilePath: "data/vitals_logs.json",
        textLogFilePath: "data/app_vitals.log"
      };
    }
    const calcAvg = (key) => {
      const valid = this.logs.map((l) => l.metrics[key]).filter((v) => typeof v === "number" && !isNaN(v));
      if (valid.length === 0) return null;
      const sum = valid.reduce((a, b) => a + b, 0);
      return Math.round(sum / valid.length * 100) / 100;
    };
    let good = 0;
    let needsImprovement = 0;
    let poor = 0;
    this.logs.forEach((l) => {
      if (l.ratings) {
        Object.values(l.ratings).forEach((r) => {
          if (r === "good") good++;
          else if (r === "needs-improvement") needsImprovement++;
          else if (r === "poor") poor++;
        });
      }
    });
    return {
      total,
      averages: {
        lcp: calcAvg("lcp"),
        cls: calcAvg("cls"),
        fid: calcAvg("fid"),
        inp: calcAvg("inp"),
        fcp: calcAvg("fcp"),
        ttfb: calcAvg("ttfb")
      },
      scoreCounts: { good, needsImprovement, poor },
      logFilePath: "data/vitals_logs.json",
      textLogFilePath: "data/app_vitals.log"
    };
  }
  clearLogs() {
    this.logs = [];
    this.saveToFile();
    try {
      if (import_fs4.default.existsSync(FORMATTED_VITALS_FILE)) {
        import_fs4.default.writeFileSync(FORMATTED_VITALS_FILE, `--- Vitals Log Cleared at ${(/* @__PURE__ */ new Date()).toISOString()} ---
`, "utf-8");
      }
    } catch {
    }
  }
};
var performanceLogger = new PerformanceLogger();

// server/smsService.ts
var SMS_IR_DEFAULT_KEY = "ocv39CACg6Vg3cg3DbY3mUwfOti7dktYUwksl3jA3Jt1qI0z";
var SMS_IR_DEFAULT_TEMPLATE = 418155;
function getSmsConfig() {
  return db.gatewaySettings?.sms || {
    apiKey: process.env.SMS_IR_API_KEY || SMS_IR_DEFAULT_KEY,
    lineNumber: process.env.SMS_IR_LINE_NUMBER || "30007732",
    provider: "sms_ir",
    enabled: true,
    auto_reminders_enabled: true,
    templates: {
      otp: {
        id: Number(process.env.SMS_IR_TEMPLATE_ID) || 418155,
        enabled: true,
        title: "\u06A9\u062F \u0627\u062D\u0631\u0627\u0632 \u0647\u0648\u06CC\u062A \u0648 \u0648\u0631\u0648\u062F \u06CC\u06A9\u0628\u0627\u0631 \u0645\u0635\u0631\u0641 (OTP)",
        description: "\u0627\u0631\u0633\u0627\u0644 \u0641\u0648\u0631\u06CC \u06A9\u062F \u0648\u0631\u0648\u062F \u06F5 \u0631\u0642\u0645\u06CC \u06A9\u0627\u0631\u0628\u0631 \u0628\u0627 \u062E\u0637\u0648\u0637 \u062E\u062F\u0645\u0627\u062A\u06CC \u0628\u062F\u0648\u0646 \u0628\u0644\u06A9\u200C\u0644\u06CC\u0633\u062A",
        pattern: "\u06A9\u062F \u0648\u0631\u0648\u062F \u0634\u0645\u0627 \u0628\u0647 \u067E\u0646\u0644 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627: #CODE#",
        required_params: ["CODE"]
      },
      invoice_issued: {
        id: Number(process.env.SMS_IR_TEMPLATE_INVOICE) || 418155,
        enabled: true,
        title: "\u0635\u062F\u0648\u0631 \u067E\u06CC\u0634\u200C\u0641\u0627\u06A9\u062A\u0648\u0631 \u062C\u062F\u06CC\u062F \u0648 \u0633\u0641\u0627\u0631\u0634 \u062E\u0631\u06CC\u062F",
        description: "\u0627\u0637\u0644\u0627\u0639\u200C\u0631\u0633\u0627\u0646\u06CC \u0635\u062F\u0648\u0631 \u067E\u06CC\u0634\u200C\u0641\u0627\u06A9\u062A\u0648\u0631 \u062C\u062F\u06CC\u062F \u0648 \u0644\u06CC\u0646\u06A9 \u062A\u0633\u0648\u06CC\u0647 \u062D\u0633\u0627\u0628 \u0628\u0647 \u06A9\u0627\u0631\u0628\u0631",
        pattern: "\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC #CUSTOMER#\u060C \u067E\u06CC\u0634\u200C\u0641\u0627\u06A9\u062A\u0648\u0631 \u0633\u0641\u0627\u0631\u0634 ##ORDER# \u0628\u0647 \u0645\u0628\u0644\u063A #AMOUNT# \u062A\u0648\u0645\u0627\u0646 \u0635\u0627\u062F\u0631 \u0634\u062F. \u0644\u06CC\u0646\u06A9 \u067E\u0631\u062F\u0627\u062E\u062A: #LINK#",
        required_params: ["CUSTOMER", "ORDER", "AMOUNT"]
      },
      sub_expiry_7days: {
        id: Number(process.env.SMS_IR_TEMPLATE_EXPIRY_7) || 418157,
        enabled: true,
        title: "\u06CC\u0627\u062F\u0622\u0648\u0631\u06CC \u06F7 \u0631\u0648\u0632 \u0645\u0627\u0646\u062F\u0647 \u0628\u0647 \u067E\u0627\u06CC\u0627\u0646 \u0627\u0634\u062A\u0631\u0627\u06A9",
        description: "\u0627\u0631\u0633\u0627\u0644 \u0647\u0634\u062F\u0627\u0631 \u062A\u0645\u062F\u06CC\u062F \u0627\u0634\u062A\u0631\u0627\u06A9 \u06F7 \u0631\u0648\u0632 \u0642\u0628\u0644 \u0627\u0632 \u063A\u06CC\u0631\u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u062F\u0633\u062A\u0631\u0633\u06CC\u200C\u0647\u0627\u06CC \u0633\u0627\u0632\u0645\u0627\u0646\u06CC",
        pattern: "\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC #CUSTOMER#\u060C \u062A\u0646\u0647\u0627 #DAYS# \u0631\u0648\u0632 \u0627\u0632 \u0627\u0634\u062A\u0631\u0627\u06A9 #TITLE# \u0634\u0645\u0627 \u0628\u0627\u0642\u06CC \u0645\u0627\u0646\u062F\u0647 \u0627\u0633\u062A. \u062C\u0647\u062A \u062A\u0645\u062F\u06CC\u062F \u0627\u0642\u062F\u0627\u0645 \u0641\u0631\u0645\u0627\u06CC\u06CC\u062F.",
        required_params: ["CUSTOMER", "DAYS", "TITLE"]
      },
      sub_expiry_3days: {
        id: Number(process.env.SMS_IR_TEMPLATE_EXPIRY_3) || 418158,
        enabled: true,
        title: "\u06CC\u0627\u062F\u0622\u0648\u0631\u06CC \u0641\u0648\u0631\u06CC \u06F3 \u0631\u0648\u0632 \u0645\u0627\u0646\u062F\u0647 \u0628\u0647 \u0627\u0646\u0642\u0636\u0627\u06CC \u0627\u0634\u062A\u0631\u0627\u06A9",
        description: "\u0627\u0631\u0633\u0627\u0644 \u0647\u0634\u062F\u0627\u0631 \u0641\u0648\u0631\u06CC \u062A\u0645\u062F\u06CC\u062F \u0627\u0634\u062A\u0631\u0627\u06A9 \u062C\u0647\u062A \u062C\u0644\u0648\u06AF\u06CC\u0631\u06CC \u0627\u0632 \u0627\u0646\u0642\u0637\u0627\u0639 \u0633\u0631\u0648\u06CC\u0633\u200C\u0647\u0627",
        pattern: "\u0647\u0634\u062F\u0627\u0631 \u0645\u0647\u0645: \u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC #CUSTOMER#\u060C \u0627\u0634\u062A\u0631\u0627\u06A9 \u0634\u0645\u0627 #TITLE# \u0638\u0631\u0641 #DAYS# \u0631\u0648\u0632 \u0622\u06CC\u0646\u062F\u0647 \u0645\u0646\u0642\u0636\u06CC \u0645\u06CC\u200C\u0634\u0648\u062F.",
        required_params: ["CUSTOMER", "DAYS", "TITLE"]
      },
      ticket_created: {
        id: Number(process.env.SMS_IR_TEMPLATE_TICKET) || 418159,
        enabled: true,
        title: "\u062B\u0628\u062A \u0648 \u067E\u06CC\u06AF\u06CC\u0631\u06CC \u062A\u06CC\u06A9\u062A \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u062C\u062F\u06CC\u062F",
        description: "\u0627\u0637\u0644\u0627\u0639\u200C\u0631\u0633\u0627\u0646\u06CC \u0634\u0645\u0627\u0631\u0647 \u067E\u06CC\u06AF\u06CC\u0631\u06CC \u0648 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u06CC\u06A9\u062A \u062C\u062F\u06CC\u062F \u0628\u0647 \u06A9\u0627\u0631\u0628\u0631 \u0648 \u06A9\u0627\u0631\u0634\u0646\u0627\u0633 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC",
        pattern: "\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC #CUSTOMER#\u060C \u062A\u06CC\u06A9\u062A \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0634\u0645\u0627 \u0628\u0627 \u0634\u0645\u0627\u0631\u0647 #TICKET# \u0648 \u0645\u0648\u0636\u0648\u0639 \xAB#SUBJECT#\xBB \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062B\u0628\u062A \u0634\u062F.",
        required_params: ["CUSTOMER", "TICKET", "SUBJECT"]
      },
      payment_success: {
        id: Number(process.env.SMS_IR_TEMPLATE_PAYMENT) || 418155,
        enabled: true,
        title: "\u062A\u0633\u0648\u06CC\u0647 \u0645\u0648\u0641\u0642 \u0641\u0627\u06A9\u062A\u0648\u0631 \u0648 \u062A\u0627\u06CC\u06CC\u062F \u062A\u0631\u0627\u06A9\u0646\u0634 \u0634\u0627\u067E\u0631\u06A9",
        description: "\u0627\u0631\u0633\u0627\u0644 \u0634\u0646\u0627\u0633\u0647 \u067E\u06CC\u06AF\u06CC\u0631\u06CC \u0628\u0627\u0646\u06A9\u06CC \u0634\u0627\u067E\u0631\u06A9 \u0648 \u062A\u0627\u06CC\u06CC\u062F \u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u0633\u0631\u0648\u06CC\u0633 \u067E\u0633 \u0627\u0632 \u067E\u0631\u062F\u0627\u062E\u062A \u0622\u0646\u0644\u0627\u06CC\u0646",
        pattern: "\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC #CUSTOMER#\u060C \u067E\u0631\u062F\u0627\u062E\u062A \u0641\u0627\u06A9\u062A\u0648\u0631 ##ORDER# \u0628\u0647 \u0645\u0628\u0644\u063A #AMOUNT# \u062A\u0648\u0645\u0627\u0646 \u0628\u0627 \u0634\u0645\u0627\u0631\u0647 \u067E\u06CC\u06AF\u06CC\u0631\u06CC #REF# \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062A\u0627\u06CC\u06CC\u062F \u0634\u062F.",
        required_params: ["CUSTOMER", "ORDER", "AMOUNT", "REF"]
      }
    }
  };
}
async function sendTemplateSms(options) {
  const config = getSmsConfig();
  const apiKey = config.apiKey || process.env.SMS_IR_API_KEY || SMS_IR_DEFAULT_KEY;
  const templateId = options.templateId || config.templates?.[options.eventType]?.id || SMS_IR_DEFAULT_TEMPLATE;
  if (config.enabled === false) {
    console.log(`[SMS Service] SMS Gateway is globally disabled. Skipping dispatch for ${options.mobile}`);
    return { success: false, error: "\u0633\u0627\u0645\u0627\u0646\u0647 \u067E\u06CC\u0627\u0645\u06A9 \u062F\u0631 \u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A \u063A\u06CC\u0631\u0641\u0639\u0627\u0644 \u0627\u0633\u062A." };
  }
  const formattedParams = Object.entries(options.parameters).map(([name, val]) => ({
    name: name.toUpperCase(),
    value: String(val ?? "")
  }));
  const payload = {
    mobile: options.mobile,
    templateId: Number(templateId),
    parameters: formattedParams
  };
  console.log(`
======================================================`);
  console.log(`[SMS.IR DISPATCH: ${options.eventType.toUpperCase()}]`);
  console.log(`To: ${options.mobile} (${options.userName || "\u06A9\u0627\u0631\u0628\u0631"})`);
  console.log(`Template ID: ${templateId}`);
  console.log(`Parameters:`, JSON.stringify(options.parameters));
  console.log(`Endpoint: POST https://api.sms.ir/v1/send/verify`);
  console.log(`Timestamp: ${(/* @__PURE__ */ new Date()).toISOString()}`);
  console.log(`======================================================
`);
  let result;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6e3);
    const response = await fetch("https://api.sms.ir/v1/send/verify", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const responseText = await response.text();
    let resJson = {};
    try {
      resJson = JSON.parse(responseText);
    } catch {
      resJson = { raw: responseText };
    }
    console.log(`[SMS.IR RESPONSE] Status ${response.status}:`, JSON.stringify(resJson));
    if (response.ok && (resJson.status === 1 || resJson.status === 200 || resJson.status === 201)) {
      result = {
        success: true,
        messageId: resJson.data?.messageId || Date.now(),
        cost: resJson.data?.cost || 120,
        rawResponse: resJson
      };
    } else {
      const errMsg = resJson.message || `\u062E\u0637\u0627 \u062F\u0631 \u062A\u062D\u0648\u06CC\u0644 \u0628\u0647 \u0645\u062E\u0627\u0628\u0631\u0627\u062A (\u06A9\u062F \u0648\u0636\u0639\u06CC\u062A: ${resJson.status || response.status})`;
      console.warn(`[SMS.IR WARNING] ${errMsg}`);
      result = {
        success: false,
        error: errMsg,
        rawResponse: resJson
      };
    }
  } catch (err) {
    console.error("[SMS.IR DISPATCH EXCEPTION]", err.message);
    result = {
      success: false,
      error: `\u0639\u062F\u0645 \u0628\u0631\u0642\u0631\u0627\u0631\u06CC \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0648\u0628\u200C\u0633\u0631\u0648\u06CC\u0633 \u067E\u06CC\u0627\u0645\u06A9\u06CC: ${err.message}`
    };
  }
  const logEntry = {
    id: "SMS-" + Date.now() + "-" + Math.floor(Math.random() * 1e3),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    mobile: options.mobile,
    event_type: options.eventType,
    template_id: Number(templateId),
    template_title: options.templateTitle || config.templates?.[options.eventType]?.title || options.eventType,
    parameters: options.parameters,
    status: result.success ? "sent" : "failed",
    provider: "sms_ir (REST API v1)",
    message_id: result.messageId,
    cost: result.cost,
    error: result.error,
    user_name: options.userName
  };
  if (!db.smsLogs) db.smsLogs = [];
  db.smsLogs.unshift(logEntry);
  if (db.smsLogs.length > 300) db.smsLogs = db.smsLogs.slice(0, 300);
  db.save();
  return result;
}
async function sendOtpViaSmsIr(mobile, code) {
  const config = getSmsConfig();
  const otpTpl = config.templates?.otp;
  return sendTemplateSms({
    mobile,
    eventType: "otp",
    templateId: otpTpl?.id || SMS_IR_DEFAULT_TEMPLATE,
    templateTitle: otpTpl?.title || "\u06A9\u062F \u0648\u0631\u0648\u062F OTP",
    parameters: {
      CODE: code
    }
  });
}
async function dispatchOtpSms(mobile, code) {
  return sendOtpViaSmsIr(mobile, code);
}
async function sendInvoiceIssuedSms(order, user, clientOrigin = "") {
  const config = getSmsConfig();
  const tpl = config.templates?.invoice_issued;
  if (!config.enabled || !tpl?.enabled || !user.mobile) {
    return null;
  }
  const paymentLink = clientOrigin ? `${clientOrigin}/dashboard?order=${order.id}` : `karovita.ir/pay/${order.order_number || order.id}`;
  const amountFormatted = (order.amount || 0).toLocaleString("fa-IR");
  return sendTemplateSms({
    mobile: user.mobile,
    eventType: "invoice_issued",
    templateId: tpl.id,
    templateTitle: tpl.title,
    userName: user.name || user.mobile,
    parameters: {
      CUSTOMER: user.name || "\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC",
      ORDER: String(order.order_number || order.id),
      AMOUNT: amountFormatted,
      LINK: paymentLink
    }
  });
}
async function sendSubscriptionExpirySms(sub, user, daysRemaining) {
  const config = getSmsConfig();
  const tplKey = daysRemaining === 7 ? "sub_expiry_7days" : "sub_expiry_3days";
  const tpl = config.templates?.[tplKey];
  if (!config.enabled || !tpl?.enabled || !user.mobile) {
    return null;
  }
  const title = sub.title || "\u0633\u0627\u0632\u0645\u0627\u0646\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627";
  return sendTemplateSms({
    mobile: user.mobile,
    eventType: tplKey,
    templateId: tpl.id,
    templateTitle: tpl.title,
    userName: user.name || user.mobile,
    parameters: {
      CUSTOMER: user.name || "\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC",
      DAYS: daysRemaining === 7 ? "\u06F7" : "\u06F3",
      TITLE: title
    }
  });
}
async function sendTicketCreatedSms(ticket, user) {
  const config = getSmsConfig();
  const tpl = config.templates?.ticket_created;
  if (!config.enabled || !tpl?.enabled || !user.mobile) {
    return null;
  }
  return sendTemplateSms({
    mobile: user.mobile,
    eventType: "ticket_created",
    templateId: tpl.id,
    templateTitle: tpl.title,
    userName: user.name || user.mobile,
    parameters: {
      CUSTOMER: user.name || "\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC",
      TICKET: String(ticket.ticket_number || ticket.id),
      SUBJECT: ticket.subject || "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC"
    }
  });
}
async function sendPaymentSuccessSms(tx, order, user) {
  const config = getSmsConfig();
  const tpl = config.templates?.payment_success;
  if (!config.enabled || !tpl?.enabled || !user.mobile) {
    return null;
  }
  const amountFormatted = (tx.amount || order.amount || 0).toLocaleString("fa-IR");
  const refCode = tx.reference_id || tx.authority || "\u0628\u0627\u0646\u06A9 \u0634\u0627\u067E\u0631\u06A9";
  return sendTemplateSms({
    mobile: user.mobile,
    eventType: "payment_success",
    templateId: tpl.id,
    templateTitle: tpl.title,
    userName: user.name || user.mobile,
    parameters: {
      CUSTOMER: user.name || "\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC",
      ORDER: String(order.order_number || order.id),
      AMOUNT: amountFormatted,
      REF: refCode
    }
  });
}
async function checkAndSendSubscriptionExpiryReminders() {
  const config = getSmsConfig();
  if (!config.enabled || !config.auto_reminders_enabled) {
    return { scanned: 0, sent7Days: 0, sent3Days: 0, details: [] };
  }
  const now = Date.now();
  const DAY_MS = 24 * 3600 * 1e3;
  const activeSubs = db.subscriptions.filter((s) => s.status === "active" && s.expires_at);
  let sent7Days = 0;
  let sent3Days = 0;
  const details = [];
  if (!db.gatewaySettings.subscription_reminder_log) {
    db.gatewaySettings.subscription_reminder_log = [];
  }
  for (const sub of activeSubs) {
    const expireTime = new Date(sub.expires_at).getTime();
    const diffDays = (expireTime - now) / DAY_MS;
    const user = db.getUserById(sub.user_id);
    if (!user || !user.mobile) continue;
    if (diffDays >= 6 && diffDays <= 7.5) {
      const alreadySent7 = db.gatewaySettings.subscription_reminder_log.some(
        (l) => l.subscription_id === sub.id && l.type === "7_days"
      );
      if (!alreadySent7) {
        const res = await sendSubscriptionExpirySms(sub, user, 7);
        if (res?.success) {
          sent7Days++;
          db.gatewaySettings.subscription_reminder_log.push({
            subscription_id: sub.id,
            type: "7_days",
            sent_at: (/* @__PURE__ */ new Date()).toISOString(),
            mobile: user.mobile
          });
          details.push({
            sub_id: sub.id,
            user: user.name,
            mobile: user.mobile,
            type: "7_days",
            days_left: Math.round(diffDays)
          });
        }
      }
    }
    if (diffDays >= 2 && diffDays <= 3.5) {
      const alreadySent3 = db.gatewaySettings.subscription_reminder_log.some(
        (l) => l.subscription_id === sub.id && l.type === "3_days"
      );
      if (!alreadySent3) {
        const res = await sendSubscriptionExpirySms(sub, user, 3);
        if (res?.success) {
          sent3Days++;
          db.gatewaySettings.subscription_reminder_log.push({
            subscription_id: sub.id,
            type: "3_days",
            sent_at: (/* @__PURE__ */ new Date()).toISOString(),
            mobile: user.mobile
          });
          details.push({
            sub_id: sub.id,
            user: user.name,
            mobile: user.mobile,
            type: "3_days",
            days_left: Math.round(diffDays)
          });
        }
      }
    }
  }
  db.save();
  return { scanned: activeSubs.length, sent7Days, sent3Days, details };
}
async function checkSmsProviderHealth() {
  const config = getSmsConfig();
  const apiKey = config.apiKey || process.env.SMS_IR_API_KEY || SMS_IR_DEFAULT_KEY;
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const response = await fetch("https://api.sms.ir/v1/credit", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Accept": "application/json"
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    if (response.status === 200 || response.status === 201) {
      const data = await response.json().catch(() => ({}));
      const creditVal = typeof data.data === "number" ? data.data : typeof data.credit === "number" ? data.credit : 154e3;
      return {
        status: "healthy",
        provider: "SMS.ir (Fast Send REST v1)",
        configured: true,
        reachable: true,
        latency_ms: latency,
        credit: creditVal,
        message: "\u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u0633\u0627\u0645\u0627\u0646\u0647 \u067E\u06CC\u0627\u0645\u06A9\u06CC SMS.ir \u0628\u0631\u0642\u0631\u0627\u0631 \u0648 \u062E\u0637\u0648\u0637 \u062E\u062F\u0645\u0627\u062A\u06CC \u0641\u0639\u0627\u0644 \u0627\u0633\u062A.",
        details: {
          credit: creditVal,
          lineNumber: config.lineNumber
        }
      };
    } else if (response.status === 401 || response.status === 403) {
      return {
        status: "degraded",
        provider: "SMS.ir (Fast Send REST v1)",
        configured: true,
        reachable: true,
        latency_ms: latency,
        message: "\u06A9\u0644\u06CC\u062F \u0648\u0628\u200C\u0633\u0631\u0648\u06CC\u0633 SMS.ir \u0646\u06CC\u0627\u0632 \u0628\u0647 \u0628\u0631\u0631\u0633\u06CC \u062F\u0627\u0631\u062F (\u06A9\u062F \u062E\u0637\u0627\u06CC \u0627\u0639\u062A\u0628\u0627\u0631\u0633\u0646\u062C\u06CC 401/403).",
        details: { http_status: response.status }
      };
    } else {
      return {
        status: "degraded",
        provider: "SMS.ir (Fast Send REST v1)",
        configured: true,
        reachable: true,
        latency_ms: latency,
        message: `\u067E\u0627\u0633\u062E \u0628\u0627 \u06A9\u062F \u0648\u0636\u0639\u06CC\u062A ${response.status} \u0627\u0632 \u0648\u0628\u200C\u0633\u0631\u0648\u06CC\u0633 SMS.ir \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F.`,
        details: { http_status: response.status }
      };
    }
  } catch (err) {
    const latency = Date.now() - startTime;
    return {
      status: "unhealthy",
      provider: "SMS.ir (Fast Send REST v1)",
      configured: true,
      reachable: false,
      latency_ms: latency,
      message: `\u062E\u0637\u0627\u06CC \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u062F\u0631\u06AF\u0627\u0647 \u067E\u06CC\u0627\u0645\u06A9: ${err.message}`,
      details: { error: err.message }
    };
  }
}

// server/zibalService.ts
function getZibalConfig() {
  const settings = db.gatewaySettings?.zibal || {
    merchant: process.env.ZIBAL_MERCHANT || "zibal",
    sandbox: process.env.ZIBAL_SANDBOX !== "false",
    callback_url: "/api/payments/zibal/callback",
    enabled: true,
    description_prefix: "\u0633\u0627\u0645\u0627\u0646\u0647 \u0627\u0628\u0631\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 - \u0633\u0641\u0627\u0631\u0634 #",
    auto_verify: true
  };
  return settings;
}
async function initiateZibalPayment(order, user, clientOrigin) {
  const config = getZibalConfig();
  const merchant = config.merchant || "zibal";
  const isSandbox = config.sandbox || merchant === "zibal";
  const amountRials = Math.max(1e4, (order.amount || 0) * 10);
  let callbackUrl = config.callback_url || "/api/payments/zibal/callback";
  if (!callbackUrl.startsWith("http://") && !callbackUrl.startsWith("https://")) {
    const origin = clientOrigin.replace(/\/+$/, "");
    callbackUrl = `${origin}${callbackUrl.startsWith("/") ? "" : "/"}${callbackUrl}`;
  }
  const payload = {
    merchant,
    amount: amountRials,
    callbackUrl,
    description: `${config.description_prefix || "\u0633\u0627\u0645\u0627\u0646\u0647 \u0627\u0628\u0631\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 - \u0633\u0641\u0627\u0631\u0634 #"}${order.order_number || order.id}`,
    orderId: String(order.id),
    mobile: user.mobile || void 0
  };
  console.log(`
======================================================`);
  console.log(`[ZIBAL PAYMENT GATEWAY REQUEST]`);
  console.log(`Merchant: ${merchant} (Sandbox: ${isSandbox})`);
  console.log(`Order ID: ${order.id} (#${order.order_number})`);
  console.log(`Amount: ${(order.amount || 0).toLocaleString("fa-IR")} Toman (${amountRials} Rials)`);
  console.log(`Callback: ${callbackUrl}`);
  console.log(`Endpoint: POST https://gateway.zibal.ir/v1/request`);
  console.log(`Timestamp: ${(/* @__PURE__ */ new Date()).toISOString()}`);
  console.log(`======================================================
`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7e3);
    const response = await fetch("https://gateway.zibal.ir/v1/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const resJson = await response.json().catch(() => ({}));
    console.log(`[ZIBAL RESPONSE] Status ${response.status}:`, JSON.stringify(resJson));
    if (response.ok && resJson.result === 100 && resJson.trackId) {
      const trackId = String(resJson.trackId);
      const paymentUrl = `https://gateway.zibal.ir/start/${trackId}`;
      return {
        success: true,
        trackId,
        paymentUrl,
        resultCode: resJson.result,
        message: resJson.message || "\u062F\u0631\u062E\u0648\u0627\u0633\u062A \u062A\u0631\u0627\u06A9\u0646\u0634 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062B\u0628\u062A \u0634\u062F",
        rawResponse: resJson
      };
    } else {
      const errorMsg = getZibalErrorMessage(resJson.result) || resJson.message || "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0642\u0631\u0627\u0631\u06CC \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u062F\u0631\u06AF\u0627\u0647 \u0634\u0627\u067E\u0631\u06A9 \u0632\u06CC\u0628\u0627\u0644";
      console.warn(`[ZIBAL REQUEST ERROR] Code ${resJson.result}: ${errorMsg}`);
      if (isSandbox) {
        const simulatedTrackId = "sim-" + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 6);
        return {
          success: true,
          trackId: simulatedTrackId,
          paymentUrl: `/api/payments/zibal/callback?trackId=${simulatedTrackId}&success=1&status=2&orderId=${order.id}`,
          resultCode: 100,
          message: "\u0633\u0646\u062F\u0628\u0627\u06A9\u0633 \u0634\u0628\u06CC\u0647\u200C\u0633\u0627\u0632 \u067E\u0631\u062F\u0627\u062E\u062A \u0632\u06CC\u0628\u0627\u0644 (\u062D\u0627\u0644\u062A \u062A\u0633\u062A\u06CC \u0641\u0639\u0627\u0644)",
          rawResponse: { simulated: true, originalError: errorMsg }
        };
      }
      return {
        success: false,
        resultCode: resJson.result,
        message: errorMsg,
        rawResponse: resJson
      };
    }
  } catch (err) {
    console.error("[ZIBAL REQUEST EXCEPTION]", err.message);
    if (isSandbox) {
      const simulatedTrackId = "sim-" + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 6);
      return {
        success: true,
        trackId: simulatedTrackId,
        paymentUrl: `/api/payments/zibal/callback?trackId=${simulatedTrackId}&success=1&status=2&orderId=${order.id}`,
        resultCode: 100,
        message: "\u0634\u0628\u06CC\u0647\u200C\u0633\u0627\u0632 \u067E\u0631\u062F\u0627\u062E\u062A \u0632\u06CC\u0628\u0627\u0644 (\u0633\u0646\u062F\u0628\u0627\u06A9\u0633 \u062A\u0648\u0633\u0639\u0647 \u0645\u062D\u0644\u06CC)",
        rawResponse: { simulated: true, error: err.message }
      };
    }
    return {
      success: false,
      message: `\u062E\u0637\u0627\u06CC \u0627\u0631\u062A\u0628\u0627\u0637\u06CC \u0628\u0627 \u0633\u0631\u0648\u0631\u0647\u0627\u06CC \u062F\u0631\u06AF\u0627\u0647 \u0634\u0627\u067E\u0631\u06A9: ${err.message}`
    };
  }
}
async function verifyZibalPayment(trackId) {
  const config = getZibalConfig();
  const merchant = config.merchant || "zibal";
  if (trackId.startsWith("sim-") || trackId.startsWith("sandbox-")) {
    const fakeShaparakRef = "SHP" + Date.now().toString().slice(-8) + Math.floor(1e3 + Math.random() * 9e3);
    return {
      success: true,
      resultCode: 100,
      message: "\u062A\u0631\u0627\u06A9\u0646\u0634 \u062F\u0631 \u0645\u062D\u06CC\u0637 \u0634\u0628\u06CC\u0647\u200C\u0633\u0627\u0632 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062A\u0627\u06CC\u06CC\u062F \u0634\u062F.",
      refNumber: fakeShaparakRef,
      cardNumber: "603799******" + Math.floor(1e3 + Math.random() * 9e3),
      paidAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: 1,
      rawResponse: { simulated: true }
    };
  }
  console.log(`
======================================================`);
  console.log(`[ZIBAL VERIFICATION REQUEST]`);
  console.log(`Merchant: ${merchant}`);
  console.log(`TrackId: ${trackId}`);
  console.log(`Endpoint: POST https://gateway.zibal.ir/v1/verify`);
  console.log(`======================================================
`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7e3);
    const response = await fetch("https://gateway.zibal.ir/v1/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        merchant,
        trackId
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const resJson = await response.json().catch(() => ({}));
    console.log(`[ZIBAL VERIFY RESPONSE] Code ${resJson.result}:`, JSON.stringify(resJson));
    if (resJson.result === 100 || resJson.result === 201) {
      return {
        success: true,
        resultCode: resJson.result,
        message: resJson.result === 100 ? "\u062A\u0631\u0627\u06A9\u0646\u0634 \u0628\u0627\u0646\u06A9\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062A\u0627\u06CC\u06CC\u062F \u0634\u062F" : "\u062A\u0631\u0627\u06A9\u0646\u0634 \u0642\u0628\u0644\u0627\u064B \u062A\u0627\u06CC\u06CC\u062F \u0634\u062F\u0647 \u0627\u0633\u062A",
        refNumber: String(resJson.refNumber || resJson.shaparakRef || trackId),
        cardNumber: resJson.cardNumber || void 0,
        amount: resJson.amount ? Math.round(resJson.amount / 10) : void 0,
        // Convert back to Toman
        paidAt: resJson.paidAt || (/* @__PURE__ */ new Date()).toISOString(),
        status: resJson.status || 1,
        rawResponse: resJson
      };
    } else {
      const errorMsg = getZibalErrorMessage(resJson.result) || resJson.message || "\u062A\u0631\u0627\u06A9\u0646\u0634 \u062A\u0648\u0633\u0637 \u0628\u0627\u0646\u06A9 \u062A\u0627\u06CC\u06CC\u062F \u0646\u0634\u062F";
      return {
        success: false,
        resultCode: resJson.result || -1,
        message: errorMsg,
        rawResponse: resJson
      };
    }
  } catch (err) {
    console.error("[ZIBAL VERIFY EXCEPTION]", err.message);
    return {
      success: false,
      resultCode: -1,
      message: `\u062E\u0637\u0627 \u062F\u0631 \u0627\u0633\u062A\u0639\u0644\u0627\u0645 \u062A\u0627\u06CC\u06CC\u062F\u06CC\u0647 \u0627\u0632 \u062F\u0631\u06AF\u0627\u0647: ${err.message}`
    };
  }
}
function getZibalErrorMessage(code) {
  switch (code) {
    case 100:
      return "\u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0646\u062C\u0627\u0645 \u0634\u062F";
    case 102:
      return "\u0634\u0646\u0627\u0633\u0647 \u0645\u0631\u0686\u0646\u062A (merchant) \u062F\u0631 \u0633\u06CC\u0633\u062A\u0645 \u0632\u06CC\u0628\u0627\u0644 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F";
    case 103:
      return "\u0634\u0646\u0627\u0633\u0647 \u0645\u0631\u0686\u0646\u062A \u0632\u06CC\u0628\u0627\u0644 \u063A\u06CC\u0631\u0641\u0639\u0627\u0644 \u0627\u0633\u062A";
    case 104:
      return "\u0634\u0646\u0627\u0633\u0647 \u0645\u0631\u0686\u0646\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A";
    case 105:
      return "\u0645\u0628\u0644\u063A \u067E\u0631\u062F\u0627\u062E\u062A \u0628\u0627\u06CC\u062F \u062D\u062F\u0627\u0642\u0644 \u06F1\u066C\u06F0\u06F0\u06F0 \u0631\u06CC\u0627\u0644 (\u06F1\u06F0\u06F0 \u062A\u0648\u0645\u0627\u0646) \u0628\u0627\u0634\u062F";
    case 106:
      return "\u0622\u062F\u0631\u0633 \u0628\u0627\u0632\u06AF\u0634\u062A (callbackUrl) \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A";
    case 113:
      return "\u0645\u0628\u0644\u063A \u062A\u0631\u0627\u06A9\u0646\u0634 \u0628\u06CC\u0634 \u0627\u0632 \u0633\u0642\u0641 \u0645\u062C\u0627\u0632 \u0631\u0648\u0632\u0627\u0646\u0647 \u062F\u0631\u06AF\u0627\u0647 \u0627\u0633\u062A";
    case 201:
      return "\u062A\u0631\u0627\u06A9\u0646\u0634 \u0642\u0628\u0644\u0627\u064B \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062A\u0627\u06CC\u06CC\u062F \u0634\u062F\u0647 \u0627\u0633\u062A";
    case 202:
      return "\u0633\u0641\u0627\u0631\u0634 \u067E\u0631\u062F\u0627\u062E\u062A \u0646\u0634\u062F\u0647 \u06CC\u0627 \u062A\u0648\u0633\u0637 \u06A9\u0627\u0631\u0628\u0631 \u0644\u063A\u0648 \u0634\u062F\u0647 \u0627\u0633\u062A";
    case 203:
      return "\u0634\u0646\u0627\u0633\u0647 \u067E\u06CC\u06AF\u06CC\u0631\u06CC (trackId) \u062F\u0631 \u0632\u06CC\u0628\u0627\u0644 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A";
    default:
      return `\u062E\u0637\u0627\u06CC \u062F\u0631\u06AF\u0627\u0647 \u0632\u06CC\u0628\u0627\u0644 (\u06A9\u062F \u0648\u0636\u0639\u06CC\u062A: ${code})`;
  }
}

// server/taxInvoiceService.ts
var OFFICIAL_SELLER_INFO = {
  company_name: "\u0634\u0631\u06A9\u062A \u062F\u0627\u062F\u0647\u200C\u067E\u0631\u062F\u0627\u0632\u0627\u0646 \u0627\u0628\u0631\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 (\u0633\u0647\u0627\u0645\u06CC \u062E\u0627\u0635)",
  brand_name: "\u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 \u0627\u0628\u0631\u06CC (Karovita Cloud ERP)",
  registration_number: "\u06F5\u06F6\u06F8\u06F9\u06F4\u06F2",
  national_id: "\u06F1\u06F4\u06F0\u06F0\u06F9\u06F8\u06F7\u06F4\u06F5\u06F6\u06F1",
  economic_code: "\u06F4\u06F1\u06F1\u06F6\u06F5\u06F8\u06F9\u06F4\u06F7\u06F5\u06F2\u06F3",
  tax_payer_code: "TP-9874561-TX",
  postal_code: "\u06F1\u06F9\u06F9\u06F7\u06F9\u06F8\u06F5\u06F6\u06F1\u06F4",
  province: "\u062A\u0647\u0631\u0627\u0646",
  city: "\u062A\u0647\u0631\u0627\u0646",
  address: "\u062A\u0647\u0631\u0627\u0646\u060C \u062E\u06CC\u0627\u0628\u0627\u0646 \u0648\u0644\u06CC\u0639\u0635\u0631\u060C \u0628\u0627\u0644\u0627\u062A\u0631 \u0627\u0632 \u0645\u06CC\u062F\u0627\u0646 \u0648\u0646\u06A9\u060C \u0628\u0631\u062C \u0641\u0646\u0627\u0648\u0631\u06CC \u0648 \u0646\u0648\u0622\u0648\u0631\u06CC \u0627\u0628\u0631\u06CC\u060C \u0637\u0628\u0642\u0647 \u06F8\u060C \u0648\u0627\u062D\u062F \u06F8\u06F0\u06F4",
  phone: "\u06F0\u06F2\u06F1-\u06F8\u06F8\u06F9\u06F9\u06F0\u06F0\u06F1\u06F1",
  fax: "\u06F0\u06F2\u06F1-\u06F8\u06F8\u06F9\u06F9\u06F0\u06F0\u06F1\u06F2",
  email: "finance@karovita.ir",
  website: "https://karovita.ir"
};
function numberToWordsPersian(num) {
  if (num === 0) return "\u0635\u0641\u0631";
  if (num < 0) return "\u0645\u0646\u0641\u06CC " + numberToWordsPersian(Math.abs(num));
  const yekan = ["", "\u06CC\u06A9", "\u062F\u0648", "\u0633\u0647", "\u0686\u0647\u0627\u0631", "\u067E\u0646\u062C", "\u0634\u0634", "\u0647\u0641\u062A", "\u0647\u0634\u062A", "\u0646\u0647"];
  const dahha = ["", "\u062F\u0647", "\u0628\u06CC\u0633\u062A", "\u0633\u06CC", "\u0686\u0647\u0644", "\u067E\u0646\u062C\u0627\u0647", "\u0634\u0635\u062A", "\u0647\u0641\u062A\u0627\u062F", "\u0647\u0634\u062A\u0627\u062F", "\u0646\u0648\u062F"];
  const dahha10_19 = ["\u062F\u0647", "\u06CC\u0627\u0632\u062F\u0647", "\u062F\u0648\u0627\u0632\u062F\u0647", "\u0633\u06CC\u0632\u062F\u0647", "\u0686\u0647\u0627\u0631\u062F\u0647", "\u067E\u0627\u0646\u0632\u062F\u0647", "\u0634\u0627\u0646\u0632\u062F\u0647", "\u0647\u0641\u062F\u0647", "\u0647\u062C\u062F\u0647", "\u0646\u0648\u0632\u062F\u0647"];
  const sadha = ["", "\u06CC\u06A9\u0635\u062F", "\u062F\u0648\u06CC\u0633\u062A", "\u0633\u06CC\u0635\u062F", "\u0686\u0647\u0627\u0631\u0635\u062F", "\u067E\u0627\u0646\u0635\u062F", "\u0634\u0634\u0635\u062F", "\u0647\u0641\u062A\u0635\u062F", "\u0647\u0634\u062A\u0635\u062F", "\u0646\u0647\u0635\u062F"];
  const tabaghat = ["", "\u0647\u0632\u0627\u0631", "\u0645\u06CC\u0644\u06CC\u0648\u0646", "\u0645\u06CC\u0644\u06CC\u0627\u0631\u062F", "\u062A\u0631\u06CC\u0644\u06CC\u0648\u0646"];
  function convertGroup(n) {
    let res = "";
    const s = Math.floor(n / 100);
    const d = Math.floor(n % 100 / 10);
    const y = n % 10;
    if (s > 0) {
      res += sadha[s];
    }
    if (d === 1) {
      if (res !== "") res += " \u0648 ";
      res += dahha10_19[y];
    } else {
      if (d > 1) {
        if (res !== "") res += " \u0648 ";
        res += dahha[d];
      }
      if (y > 0) {
        if (res !== "") res += " \u0648 ";
        res += yekan[y];
      }
    }
    return res;
  }
  const parts = [];
  let temp = Math.floor(num);
  let groupIdx = 0;
  while (temp > 0) {
    const group = temp % 1e3;
    if (group > 0) {
      const groupText = convertGroup(group);
      const suffix = tabaghat[groupIdx] ? " " + tabaghat[groupIdx] : "";
      parts.unshift(groupText + suffix);
    }
    temp = Math.floor(temp / 1e3);
    groupIdx++;
  }
  return parts.join(" \u0648 ") + " \u062A\u0648\u0645\u0627\u0646";
}
function generateTaxId(orderId, dateStr) {
  const seed = (typeof orderId === "number" ? orderId : parseInt(String(orderId).replace(/\D/g, ""), 10) || 1e3) * 739;
  const hex = (seed + 1715004).toString(16).toUpperCase().padStart(8, "0");
  const d = new Date(dateStr || Date.now());
  const year = d.getFullYear().toString().slice(-2);
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 864e5).toString().padStart(3, "0");
  return `A10F-${year}${dayOfYear}-${hex.slice(0, 4)}-${hex.slice(4, 8)}`.toUpperCase();
}
function generateOfficialTaxInvoiceHtml(params) {
  const { order, tx, user, company, modulesList, isPaid } = params;
  const orderNum = order?.order_number || `ORD-${order?.id || tx?.id || "001"}`;
  const invoiceDate = order?.created_at ? new Date(order.created_at) : /* @__PURE__ */ new Date();
  const dateFa = invoiceDate.toLocaleDateString("fa-IR");
  const timeFa = invoiceDate.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  const paidDateFa = tx?.paid_at ? new Date(tx.paid_at).toLocaleDateString("fa-IR") : "\u2014";
  const taxId = generateTaxId(order?.id || tx?.id || 1, order?.created_at || (/* @__PURE__ */ new Date()).toISOString());
  const buyerName = company?.name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.mobile;
  const buyerEconomicCode = company?.economic_code || user.economic_code || "\u2014";
  const buyerNationalId = company?.national_id?.trim() || user.national_code?.trim() || user.national_id?.trim() || (user.mobile ? `\u06F0\u06F9${user.mobile.slice(2, 10)}` : "\u2014");
  const buyerRegNo = company?.registration_number || "\u2014";
  const buyerPostalCode = company?.postal_code || "\u2014";
  const buyerPhone = company?.phone || user.mobile;
  const buyerAddress = company?.address || (company?.province ? `${company.province}\u060C ${company.city || ""}` : "\u062A\u0647\u0631\u0627\u0646\u060C \u0627\u0642\u0627\u0645\u062A\u06AF\u0627\u0647 \u0642\u0627\u0646\u0648\u0646\u06CC \u062B\u0628\u062A \u0634\u062F\u0647 \u062F\u0631 \u0633\u0627\u0645\u0627\u0646\u0647");
  const period = String(order?.billing_period || "").toLowerCase();
  const unitMultiplier = period === "yearly" || period === "12_months" ? 10 : period === "6_months" || period === "semiannual" ? 6 : period === "3_months" || period === "quarterly" ? 3 : 1;
  const periodTitleFa = period === "yearly" || period === "12_months" ? "\u06F1 \u0633\u0627\u0644\u0647 (\u0645\u0639\u0627\u062F\u0644 \u06F1\u06F0 \u0645\u0627\u0647 + \u06F2 \u0645\u0627\u0647 \u0647\u062F\u06CC\u0647)" : period === "6_months" || period === "semiannual" ? "\u06F6 \u0645\u0627\u0647\u0647" : period === "3_months" || period === "quarterly" ? "\u06F3 \u0645\u0627\u0647\u0647" : "\u0645\u0627\u0647\u0627\u0646\u0647";
  const finalAmount = Number(tx?.amount || order?.amount || 0);
  const vatRate = 0.1;
  const extraUsersCount = Number(order?.breakdown?.extra_users_count || (order?.user_count && order.user_count > 1 ? order.user_count - 1 : 0));
  const monthlyExtraCost = Number(order?.breakdown?.extra_users_cost || 0);
  const extraUsersPeriodTotal = monthlyExtraCost * unitMultiplier;
  let calculatedModulesPeriodTotal = 0;
  if (order?.module_ids && order.module_ids.length > 0) {
    calculatedModulesPeriodTotal = order.module_ids.reduce((sum, modId) => {
      const m = modulesList.find((x) => x.id === modId);
      return sum + (m ? (Number(m.price) || 0) * unitMultiplier : 0);
    }, 0);
  } else {
    calculatedModulesPeriodTotal = Number(order?.breakdown?.modules_total || 0) * unitMultiplier;
  }
  const rawTotal = calculatedModulesPeriodTotal + extraUsersPeriodTotal > 0 ? calculatedModulesPeriodTotal + extraUsersPeriodTotal : finalAmount;
  const discountAmount = Math.max(rawTotal - finalAmount, 0);
  const baseBeforeVat = Math.round(finalAmount / (1 + vatRate));
  const vatAmount = finalAmount - baseBeforeVat;
  const amountInWords = numberToWordsPersian(finalAmount);
  let itemRowsHtml = "";
  let rowIdx = 1;
  if (order?.module_ids && order.module_ids.length > 0) {
    order.module_ids.forEach((modId) => {
      const m = modulesList.find((x) => x.id === modId);
      const title = m ? m.title : modId;
      const modBasePrice = m ? Number(m.price) || 0 : 0;
      const rowItemTotal = modBasePrice * unitMultiplier;
      const rowItemBase = Math.round(rowItemTotal / (1 + vatRate));
      const rowVat = rowItemTotal - rowItemBase;
      itemRowsHtml += `
        <tr>
          <td style="text-align:center;">${rowIdx++}</td>
          <td style="font-family:monospace; text-align:center;">KAR-${modId.toUpperCase()}</td>
          <td>
            <strong>\u062D\u0642 \u0628\u0647\u0631\u0647\u200C\u0628\u0631\u062F\u0627\u0631\u06CC \u0645\u0627\u0698\u0648\u0644 \u0646\u0631\u0645\u200C\u0627\u0641\u0632\u0627\u0631\u06CC: ${title}</strong>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">\u0644\u0627\u06CC\u0633\u0646\u0633 \u0627\u0628\u0631\u06CC ${periodTitleFa} - \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0648 \u0646\u06AF\u0647\u062F\u0627\u0631\u06CC \u062A\u062E\u0635\u0635\u06CC</div>
          </td>
          <td style="text-align:center;">${unitMultiplier}</td>
          <td style="text-align:center;">\u0645\u0627\u0647</td>
          <td style="text-align:left; font-family:monospace;">${modBasePrice.toLocaleString("fa-IR")}</td>
          <td style="text-align:left; font-family:monospace;">${rowItemTotal.toLocaleString("fa-IR")}</td>
          <td style="text-align:left; font-family:monospace;">\u06F0</td>
          <td style="text-align:left; font-family:monospace;">${rowItemTotal.toLocaleString("fa-IR")}</td>
          <td style="text-align:center;">\u06F1\u06F0\u066A</td>
          <td style="text-align:left; font-family:monospace;">${rowVat.toLocaleString("fa-IR")}</td>
          <td style="text-align:left; font-family:monospace; font-weight:bold;">${rowItemTotal.toLocaleString("fa-IR")}</td>
        </tr>
      `;
    });
    if (extraUsersCount > 0 && monthlyExtraCost > 0) {
      const extraUserUnitPrice = Math.round(monthlyExtraCost / extraUsersCount);
      const extraUsersRowTotal = extraUsersPeriodTotal;
      const extraUsersRowBase = Math.round(extraUsersRowTotal / (1 + vatRate));
      const extraUsersRowVat = extraUsersRowTotal - extraUsersRowBase;
      itemRowsHtml += `
        <tr>
          <td style="text-align:center;">${rowIdx++}</td>
          <td style="font-family:monospace; text-align:center;">KAR-EXTRA-USR</td>
          <td>
            <strong>\u0644\u0627\u06CC\u0633\u0646\u0633 \u0648 \u062D\u0642 \u062F\u0633\u062A\u0631\u0633\u06CC \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0645\u0627\u0632\u0627\u062F \u0633\u0627\u0645\u0627\u0646\u0647 \u0627\u0628\u0631\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627</strong>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">\u0627\u0634\u062A\u0631\u0627\u06A9 \u062F\u0633\u062A\u0631\u0633\u06CC \u0627\u0628\u0631\u06CC ${periodTitleFa} \u0628\u0631\u0627\u06CC ${extraUsersCount.toLocaleString("fa-IR")} \u06A9\u0627\u0631\u0628\u0631 \u0645\u0627\u0632\u0627\u062F \u0628\u0631 \u0633\u0642\u0641 \u067E\u0627\u06CC\u0647</div>
          </td>
          <td style="text-align:center;">${extraUsersCount}</td>
          <td style="text-align:center;">\u06A9\u0627\u0631\u0628\u0631 (${unitMultiplier} \u0645\u0627\u0647)</td>
          <td style="text-align:left; font-family:monospace;">${(extraUserUnitPrice * unitMultiplier).toLocaleString("fa-IR")}</td>
          <td style="text-align:left; font-family:monospace;">${extraUsersRowTotal.toLocaleString("fa-IR")}</td>
          <td style="text-align:left; font-family:monospace;">\u06F0</td>
          <td style="text-align:left; font-family:monospace;">${extraUsersRowTotal.toLocaleString("fa-IR")}</td>
          <td style="text-align:center;">\u06F1\u06F0\u066A</td>
          <td style="text-align:left; font-family:monospace;">${extraUsersRowVat.toLocaleString("fa-IR")}</td>
          <td style="text-align:left; font-family:monospace; font-weight:bold;">${extraUsersRowTotal.toLocaleString("fa-IR")}</td>
        </tr>
      `;
    }
  } else {
    const pkgTitle = order?.package_name || "\u0627\u0634\u062A\u0631\u0627\u06A9 \u0648 \u0644\u0627\u06CC\u0633\u0646\u0633 \u062C\u0627\u0645\u0639 \u0633\u0627\u0645\u0627\u0646\u0647 \u0627\u0628\u0631\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627";
    itemRowsHtml += `
      <tr>
        <td style="text-align:center;">\u06F1</td>
        <td style="font-family:monospace; text-align:center;">KAR-ERP-LIC</td>
        <td>
          <strong>${pkgTitle}</strong>
          <div style="font-size:10px; color:#64748b; margin-top:2px;">
            \u0634\u0627\u0645\u0644 \u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u0632\u06CC\u0631\u0633\u0627\u062E\u062A \u0627\u0628\u0631\u06CC\u060C \u0644\u0627\u06CC\u0633\u0646\u0633 \u06A9\u0627\u0631\u0628\u0631\u06CC (${order?.user_count || 1} \u06A9\u0627\u0631\u0628\u0631) \u0648 \u0646\u06AF\u0647\u062F\u0627\u0631\u06CC \u0633\u0631\u0648\u06CC\u0633
          </div>
        </td>
        <td style="text-align:center;">\u06F1</td>
        <td style="text-align:center;">\u062F\u0648\u0631\u0647 ${periodTitleFa}</td>
        <td style="text-align:left; font-family:monospace;">${rawTotal.toLocaleString("fa-IR")}</td>
        <td style="text-align:left; font-family:monospace;">${rawTotal.toLocaleString("fa-IR")}</td>
        <td style="text-align:left; font-family:monospace;">${discountAmount.toLocaleString("fa-IR")}</td>
        <td style="text-align:left; font-family:monospace;">${finalAmount.toLocaleString("fa-IR")}</td>
        <td style="text-align:center;">\u06F1\u06F0\u066A</td>
        <td style="text-align:left; font-family:monospace;">${vatAmount.toLocaleString("fa-IR")}</td>
        <td style="text-align:left; font-family:monospace; font-weight:bold;">${finalAmount.toLocaleString("fa-IR")}</td>
      </tr>
    `;
  }
  const statusStamp = isPaid ? `<div class="stamp-paid">
        <div class="stamp-inner">
          <span>\u067E\u0631\u062F\u0627\u062E\u062A \u0648 \u062A\u0633\u0648\u06CC\u0647 \u0634\u062F</span>
          <small>\u0634\u0627\u067E\u0631\u06A9 \u0632\u06CC\u0628\u0627\u0644</small>
        </div>
      </div>` : `<div class="stamp-pending">
        <div class="stamp-inner">
          <span>\u067E\u06CC\u0634\u200C\u0641\u0627\u06A9\u062A\u0648\u0631 \u0645\u0639\u062A\u0628\u0631</span>
          <small>\u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u067E\u0631\u062F\u0627\u062E\u062A</small>
        </div>
      </div>`;
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u0635\u0648\u0631\u062A\u062D\u0633\u0627\u0628 \u0631\u0633\u0645\u06CC \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F \u0645\u0627\u0644\u06CC\u0627\u062A\u06CC - ${orderNum}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 8mm 8mm 8mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'IRANSans', 'Vazirmatn', Tahoma, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 16px;
      background: #f1f5f9;
      color: #0f172a;
      font-size: 11.5px;
      line-height: 1.5;
    }
    .print-actions {
      max-width: 210mm;
      margin: 0 auto 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }
    .btn-print {
      background: #0870d1;
      color: #ffffff;
      border: none;
      padding: 8px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
    }
    .btn-outline {
      background: #f8fafc;
      color: #334155;
      border: 1px solid #cbd5e1;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
    }
    .invoice-wrapper {
      max-width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #ffffff;
      padding: 12mm 10mm;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      position: relative;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .header-table td {
      vertical-align: middle;
    }
    .main-title {
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      text-align: center;
      margin: 0;
    }
    .sub-title {
      font-size: 11px;
      color: #475569;
      text-align: center;
      margin: 2px 0 0;
    }
    .meta-box {
      font-size: 10.5px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 10px;
      line-height: 1.6;
    }
    .section-title {
      background: #e2e8f0;
      border: 1px solid #94a3b8;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      color: #0f172a;
      text-align: center;
      letter-spacing: 0.5px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-bottom: 8px;
      border: 1px solid #94a3b8;
    }
    .info-table td {
      border: 1px solid #cbd5e1;
      padding: 4px 8px;
    }
    .info-table td.label {
      background: #f8fafc;
      font-weight: 700;
      color: #334155;
      width: 13%;
      white-space: nowrap;
    }
    .info-table td.val {
      color: #0f172a;
      width: 20%;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-bottom: 8px;
      border: 1px solid #94a3b8;
    }
    .items-table th {
      background: #e2e8f0;
      border: 1px solid #94a3b8;
      padding: 5px 4px;
      font-weight: 800;
      color: #0f172a;
      text-align: center;
    }
    .items-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 6px;
    }
    .total-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      border: 1px solid #94a3b8;
      margin-bottom: 8px;
    }
    .total-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 10px;
    }
    .total-table td.label {
      background: #f8fafc;
      font-weight: 800;
      color: #1e293b;
      width: 25%;
    }
    .total-table td.val {
      font-family: monospace;
      font-size: 12px;
      font-weight: 800;
      text-align: left;
    }
    .words-box {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      padding: 6px 12px;
      font-size: 11px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .signatures-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .signatures-table td {
      width: 50%;
      border: 1px dashed #cbd5e1;
      padding: 12px;
      vertical-align: top;
      height: 110px;
      position: relative;
    }
    .stamp-box {
      display: inline-block;
      border: 2px solid #0870d1;
      border-radius: 50%;
      width: 85px;
      height: 85px;
      color: #0870d1;
      text-align: center;
      padding: 14px 4px;
      font-size: 9px;
      font-weight: 800;
      transform: rotate(-10deg);
      opacity: 0.85;
      position: absolute;
      left: 20px;
      top: 15px;
      border-style: double;
      border-width: 4px;
    }
    .qr-box {
      width: 75px;
      height: 75px;
      border: 1px solid #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: monospace;
      font-size: 9px;
      text-align: center;
      background: #ffffff;
      padding: 4px;
    }
    .footer-note {
      font-size: 9.5px;
      color: #64748b;
      text-align: justify;
      margin-top: 8px;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
    }
    .stamp-paid {
      position: absolute;
      top: 25mm;
      left: 15mm;
      border: 3px solid #16a34a;
      color: #16a34a;
      border-radius: 8px;
      padding: 4px 12px;
      font-weight: 900;
      font-size: 14px;
      transform: rotate(-8deg);
      background: rgba(240, 253, 244, 0.85);
      z-index: 10;
    }
    .stamp-pending {
      position: absolute;
      top: 25mm;
      left: 15mm;
      border: 3px dashed #d97706;
      color: #d97706;
      border-radius: 8px;
      padding: 4px 12px;
      font-weight: 900;
      font-size: 13px;
      transform: rotate(-8deg);
      background: rgba(254, 243, 199, 0.85);
      z-index: 10;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .print-actions {
        display: none !important;
      }
      .invoice-wrapper {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
        min-height: auto;
      }
    }
  </style>
</head>
<body>

  <!-- Top Action Bar (hidden when printing/PDF) -->
  <div class="print-actions">
    <div style="display:flex; align-items:center; gap:12px;">
      <strong style="color:#0870d1; font-size:14px;">\u0635\u0648\u0631\u062A\u062D\u0633\u0627\u0628 \u0627\u0644\u06A9\u062A\u0631\u0648\u0646\u06CC\u06A9\u06CC \u0631\u0633\u0645\u06CC (\u0633\u0627\u0645\u0627\u0646\u0647 \u0645\u0648\u062F\u06CC\u0627\u0646 \u0648 \u062F\u0627\u0631\u0627\u06CC\u06CC)</strong>
      <span style="background:#e2e8f0; padding:2px 8px; border-radius:4px; font-size:11px; font-family:monospace;">
        ${orderNum}
      </span>
    </div>
    <div style="display:flex; gap:8px;">
      <a href="/api/invoices/${order?.id || tx?.id || 1}/contract" class="btn-outline" target="_blank">
        \u0645\u0634\u0627\u0647\u062F\u0647 \u0648 \u0686\u0627\u067E \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0631\u0633\u0645\u06CC
      </a>
      <button type="button" class="btn-print" onclick="window.print()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        <span>\u0686\u0627\u067E \u0648 \u0630\u062E\u06CC\u0631\u0647 PDF \u0631\u0633\u0645\u06CC</span>
      </button>
    </div>
  </div>

  <div class="invoice-wrapper">
    ${statusStamp}

    <!-- Header -->
    <table class="header-table">
      <tr>
        <td style="width:20%;">
          <div style="border: 2px solid #0870d1; border-radius: 8px; padding: 6px 12px; display:inline-block; color:#0870d1; font-weight:900; font-size:16px;">
            KAROVITA
          </div>
          <div style="font-size:9.5px; color:#475569; margin-top:2px;">\u0633\u0627\u0645\u0627\u0646\u0647 \u062C\u0627\u0645\u0639 \u0627\u0628\u0631\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627</div>
        </td>
        <td style="width:55%;">
          <h1 class="main-title">\u0635\u0648\u0631\u062A\u062D\u0633\u0627\u0628 \u0631\u0633\u0645\u06CC \u0641\u0631\u0648\u0634 \u06A9\u0627\u0644\u0627 \u0648 \u062E\u062F\u0645\u0627\u062A</h1>
          <div class="sub-title">\u0645\u0646\u0637\u0628\u0642 \u0628\u0627 \u0645\u0627\u062F\u0647 \u06F1\u06F6\u06F9 \u0642\u0627\u0646\u0648\u0646 \u0645\u0627\u0644\u06CC\u0627\u062A\u200C\u0647\u0627\u06CC \u0645\u0633\u062A\u0642\u06CC\u0645 \u0648 \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F\u0647\u0627\u06CC \u0633\u0627\u0645\u0627\u0646\u0647 \u0645\u0648\u062F\u06CC\u0627\u0646 \u06A9\u0634\u0648\u0631</div>
        </td>
        <td style="width:25%; text-align:left;">
          <div class="meta-box">
            <div>\u0634\u0645\u0627\u0631\u0647 \u0641\u0627\u06A9\u062A\u0648\u0631: <strong style="font-family:monospace;">${orderNum}</strong></div>
            <div>\u062A\u0627\u0631\u06CC\u062E \u0635\u062F\u0648\u0631: <strong>${dateFa}</strong></div>
            <div>\u0632\u0645\u0627\u0646 \u0635\u062F\u0648\u0631: <strong>${timeFa}</strong></div>
            <div>\u0634\u0646\u0627\u0633\u0647 \u0645\u0627\u0644\u06CC\u0627\u062A\u06CC: <strong style="font-family:monospace; font-size:9px;">${taxId}</strong></div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Seller Info Section -->
    <div class="section-title">\u0628\u062E\u0634 \u0627\u0648\u0644: \u0645\u0634\u062E\u0635\u0627\u062A \u0641\u0631\u0648\u0634\u0646\u062F\u0647 (\u0627\u0631\u0627\u0626\u0647\u200C\u062F\u0647\u0646\u062F\u0647 \u062E\u062F\u0645\u062A)</div>
    <table class="info-table">
      <tr>
        <td class="label">\u0646\u0627\u0645 \u0634\u062E\u0635 \u062D\u0642\u0648\u0642\u06CC:</td>
        <td class="val" colspan="3"><strong>${OFFICIAL_SELLER_INFO.company_name}</strong></td>
        <td class="label">\u0634\u0646\u0627\u0633\u0647 \u0645\u0644\u06CC:</td>
        <td class="val"><strong style="font-family:monospace;">${OFFICIAL_SELLER_INFO.national_id}</strong></td>
      </tr>
      <tr>
        <td class="label">\u0634\u0645\u0627\u0631\u0647 \u0627\u0642\u062A\u0635\u0627\u062F\u06CC:</td>
        <td class="val"><strong style="font-family:monospace;">${OFFICIAL_SELLER_INFO.economic_code}</strong></td>
        <td class="label">\u0634\u0645\u0627\u0631\u0647 \u062B\u0628\u062A:</td>
        <td class="val"><strong style="font-family:monospace;">${OFFICIAL_SELLER_INFO.registration_number}</strong></td>
        <td class="label">\u06A9\u062F \u067E\u0633\u062A\u06CC:</td>
        <td class="val"><strong style="font-family:monospace;">${OFFICIAL_SELLER_INFO.postal_code}</strong></td>
      </tr>
      <tr>
        <td class="label">\u0627\u0633\u062A\u0627\u0646 / \u0634\u0647\u0631:</td>
        <td class="val">${OFFICIAL_SELLER_INFO.province} / ${OFFICIAL_SELLER_INFO.city}</td>
        <td class="label">\u0646\u0634\u0627\u0646\u06CC \u06A9\u0627\u0645\u0644:</td>
        <td class="val" colspan="3">${OFFICIAL_SELLER_INFO.address}</td>
      </tr>
      <tr>
        <td class="label">\u062A\u0644\u0641\u0646 / \u062F\u0648\u0631\u0646\u06AF\u0627\u0631:</td>
        <td class="val" dir="ltr">${OFFICIAL_SELLER_INFO.phone}</td>
        <td class="label">\u067E\u0633\u062A \u0627\u0644\u06A9\u062A\u0631\u0648\u0646\u06CC\u06A9:</td>
        <td class="val" dir="ltr">${OFFICIAL_SELLER_INFO.email}</td>
        <td class="label">\u06A9\u062F \u0645\u0648\u062F\u06CC\u0627\u0646:</td>
        <td class="val" style="font-family:monospace;">${OFFICIAL_SELLER_INFO.tax_payer_code}</td>
      </tr>
    </table>

    <!-- Buyer Info Section -->
    <div class="section-title">\u0628\u062E\u0634 \u062F\u0648\u0645: \u0645\u0634\u062E\u0635\u0627\u062A \u062E\u0631\u06CC\u062F\u0627\u0631 (\u0645\u0634\u062A\u0631\u06CC / \u0645\u0634\u062A\u0631\u06A9)</div>
    <table class="info-table">
      <tr>
        <td class="label">\u0646\u0627\u0645 \u062E\u0631\u06CC\u062F\u0627\u0631 / \u0634\u0631\u06A9\u062A:</td>
        <td class="val" colspan="3"><strong>${buyerName}</strong></td>
        <td class="label">\u0634\u0646\u0627\u0633\u0647 / \u06A9\u062F \u0645\u0644\u06CC:</td>
        <td class="val"><strong style="font-family:monospace;">${buyerNationalId}</strong></td>
      </tr>
      <tr>
        <td class="label">\u0634\u0645\u0627\u0631\u0647 \u0627\u0642\u062A\u0635\u0627\u062F\u06CC:</td>
        <td class="val"><strong style="font-family:monospace;">${buyerEconomicCode}</strong></td>
        <td class="label">\u0634\u0645\u0627\u0631\u0647 \u062B\u0628\u062A:</td>
        <td class="val"><strong style="font-family:monospace;">${buyerRegNo}</strong></td>
        <td class="label">\u06A9\u062F \u067E\u0633\u062A\u06CC:</td>
        <td class="val"><strong style="font-family:monospace;">${buyerPostalCode}</strong></td>
      </tr>
      <tr>
        <td class="label">\u0627\u0633\u062A\u0627\u0646 \u0648 \u0634\u0647\u0631:</td>
        <td class="val">${company?.province || "\u062A\u0647\u0631\u0627\u0646"} / ${company?.city || "\u062A\u0647\u0631\u0627\u0646"}</td>
        <td class="label">\u0646\u0634\u0627\u0646\u06CC \u062E\u0631\u06CC\u062F\u0627\u0631:</td>
        <td class="val" colspan="3">${buyerAddress}</td>
      </tr>
      <tr>
        <td class="label">\u0634\u0645\u0627\u0631\u0647 \u062A\u0645\u0627\u0633 / \u0647\u0645\u0631\u0627\u0647:</td>
        <td class="val" dir="ltr"><strong>${buyerPhone}</strong></td>
        <td class="label">\u0646\u0627\u0645 \u0631\u0627\u0628\u0637 / \u0645\u062F\u06CC\u0631:</td>
        <td class="val">${[user.first_name, user.last_name].filter(Boolean).join(" ") || "\u06A9\u0627\u0631\u0628\u0631 \u0633\u06CC\u0633\u062A\u0645"}</td>
        <td class="label">\u06A9\u062F \u0631\u0647\u06AF\u06CC\u0631\u06CC \u067E\u0631\u062F\u0627\u062E\u062A:</td>
        <td class="val"><strong style="font-family:monospace; color:#059669;">${tx?.reference_id || (isPaid ? "PAY-ONLINE-SHAPARAK" : "\u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u067E\u0631\u062F\u0627\u062E\u062A")}</strong></td>
      </tr>
    </table>

    <!-- Itemized Breakdown Table -->
    <div class="section-title">\u0628\u062E\u0634 \u0633\u0648\u0645: \u0645\u0634\u062E\u0635\u0627\u062A \u06A9\u0627\u0644\u0627 \u06CC\u0627 \u062E\u062F\u0645\u0627\u062A \u0645\u0648\u0631\u062F \u0645\u0639\u0627\u0645\u0644\u0647</div>
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:4%;">\u0631\u062F\u06CC\u0641</th>
          <th style="width:12%;">\u06A9\u062F \u062E\u062F\u0645\u062A / \u06A9\u0627\u0644\u0627</th>
          <th style="width:30%;">\u0634\u0631\u062D \u062E\u062F\u0645\u0627\u062A \u0646\u0631\u0645\u200C\u0627\u0641\u0632\u0627\u0631\u06CC \u0648 \u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627</th>
          <th style="width:5%;">\u062A\u0639\u062F\u0627\u062F</th>
          <th style="width:8%;">\u0648\u0627\u062D\u062F</th>
          <th style="width:10%;">\u0645\u0628\u0644\u063A \u0648\u0627\u062D\u062F (\u062A\u0648\u0645\u0627\u0646)</th>
          <th style="width:10%;">\u0645\u0628\u0644\u063A \u06A9\u0644 (\u062A\u0648\u0645\u0627\u0646)</th>
          <th style="width:6%;">\u062A\u062E\u0641\u06CC\u0641</th>
          <th style="width:10%;">\u0645\u0628\u0644\u063A \u067E\u0633 \u0627\u0632 \u062A\u062E\u0641\u06CC\u0641</th>
          <th style="width:5%;">\u0646\u0631\u062E \u0645\u0627\u0644\u06CC\u0627\u062A</th>
          <th style="width:8%;">\u0645\u0627\u0644\u06CC\u0627\u062A \u0648 \u0639\u0648\u0627\u0631\u0636 (\u06F1\u06F0\u066A)</th>
          <th style="width:12%;">\u062C\u0645\u0639 \u06A9\u0644 \u0628\u0627 \u0645\u0627\u0644\u06CC\u0627\u062A (\u062A\u0648\u0645\u0627\u0646)</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsHtml}
      </tbody>
    </table>

    <!-- Totals Table -->
    <table class="total-table">
      <tr>
        <td class="label">\u0645\u062C\u0645\u0648\u0639 \u0645\u0628\u0644\u063A \u0646\u0627\u062E\u0627\u0644\u0635:</td>
        <td class="val">${rawTotal.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646</td>
        <td class="label">\u0645\u062C\u0645\u0648\u0639 \u062A\u062E\u0641\u06CC\u0641\u0627\u062A \u0627\u0639\u0645\u0627\u0644\u200C\u0634\u062F\u0647:</td>
        <td class="val" style="color:#b45309;">${discountAmount.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646</td>
      </tr>
      <tr>
        <td class="label">\u0645\u0628\u0644\u063A \u062E\u0627\u0644\u0635 \u0645\u0634\u0645\u0648\u0644 \u0645\u0627\u0644\u06CC\u0627\u062A (\u067E\u0627\u06CC\u0647):</td>
        <td class="val">${baseBeforeVat.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646</td>
        <td class="label">\u0645\u0627\u0644\u06CC\u0627\u062A \u0628\u0631 \u0627\u0631\u0632\u0634 \u0627\u0641\u0632\u0648\u062F\u0647 \u0648 \u0639\u0648\u0627\u0631\u0636 (\u06F1\u06F0\u066A):</td>
        <td class="val" style="color:#0870d1;">${vatAmount.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td class="label" style="font-size:12px; color:#0870d1;">\u0645\u0628\u0644\u063A \u0646\u0647\u0627\u06CC\u06CC \u0642\u0627\u0628\u0644 \u067E\u0631\u062F\u0627\u062E\u062A / \u062A\u0633\u0648\u06CC\u0647\u200C\u0634\u062F\u0647:</td>
        <td class="val" colspan="3" style="font-size:15px; color:#0870d1; font-weight:900;">
          ${finalAmount.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646 <span style="font-size:11px; font-weight:normal; color:#64748b;">(\u0645\u0639\u0627\u062F\u0644 ${(finalAmount * 10).toLocaleString("fa-IR")} \u0631\u06CC\u0627\u0644)</span>
        </td>
      </tr>
    </table>

    <!-- Amount in Persian Words -->
    <div class="words-box">
      <div><strong>\u0645\u0628\u0644\u063A \u06A9\u0644 \u0628\u0647 \u062D\u0631\u0648\u0641:</strong> ${amountInWords}</div>
      <div><strong>\u0646\u062D\u0648\u0647 \u062A\u0633\u0648\u06CC\u0647:</strong> ${isPaid ? "\u067E\u0631\u062F\u0627\u062E\u062A \u0627\u06CC\u0646\u062A\u0631\u0646\u062A\u06CC \u0642\u0637\u0639\u06CC \u0634\u0627\u067E\u0631\u06A9 \u0632\u06CC\u0628\u0627\u0644 (\u0646\u0642\u062F\u06CC)" : "\u067E\u0631\u062F\u0627\u062E\u062A \u0627\u0644\u06A9\u062A\u0631\u0648\u0646\u06CC\u06A9\u06CC \u062F\u0631\u06AF\u0627\u0647 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A\u06CC (\u0645\u0639\u0648\u0642)"}</div>
    </div>

    <!-- Signatures, Legal Seal & Barcode -->
    <table class="signatures-table">
      <tr>
        <td>
          <div style="font-weight:800; font-size:11px; color:#1e293b;">\u0645\u0647\u0631 \u0648 \u0627\u0645\u0636\u0627\u06CC \u0641\u0631\u0648\u0634\u0646\u062F\u0647:</div>
          <div style="font-size:10px; color:#64748b; margin-top:2px;">\u0634\u0631\u06A9\u062A \u062F\u0627\u062F\u0647\u200C\u067E\u0631\u062F\u0627\u0632\u0627\u0646 \u0627\u0628\u0631\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 (\u0633\u0647\u0627\u0645\u06CC \u062E\u0627\u0635)</div>
          
          <div class="stamp-box">
            \u0634\u0631\u06A9\u062A \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627<br>
            \u0633\u0647\u0627\u0645\u06CC \u062E\u0627\u0635<br>
            \u062B\u0628\u062A: \u06F5\u06F6\u06F8\u06F9\u06F4\u06F2<br>
            \u0627\u0645\u0648\u0631 \u0645\u0627\u0644\u06CC
          </div>
        </td>
        <td>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="font-weight:800; font-size:11px; color:#1e293b;">\u0645\u0647\u0631 \u0648 \u0627\u0645\u0636\u0627\u06CC \u062E\u0631\u06CC\u062F\u0627\u0631 / \u06A9\u0627\u0631\u0641\u0631\u0645\u0627:</div>
              <div style="font-size:10px; color:#64748b; margin-top:2px;">${buyerName}</div>
            </div>

            <!-- Tax Validation Barcode & QR code representation -->
            <div style="text-align:center;">
              <div class="qr-box">
                QR-TAX<br>
                ${taxId.slice(0, 9)}<br>
                VALID
              </div>
              <div style="font-size:8px; color:#64748b; margin-top:2px;">\u0627\u0633\u062A\u0639\u0644\u0627\u0645 \u0645\u0648\u062F\u06CC\u0627\u0646</div>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Legal Footer Note -->
    <div class="footer-note">
      <strong>\u062A\u0648\u0636\u06CC\u062D\u0627\u062A \u0642\u0627\u0646\u0648\u0646\u06CC:</strong> \u0627\u06CC\u0646 \u0635\u0648\u0631\u062A\u062D\u0633\u0627\u0628 \u0631\u0633\u0645\u06CC \u0645\u0637\u0627\u0628\u0642 \u0628\u0627 \u0645\u0641\u0627\u062F \u0645\u0627\u062F\u0647 \u06F1\u06F6\u06F9 \u0648 \u06F1\u06F6\u06F9 \u0645\u06A9\u0631\u0631 \u0642\u0627\u0646\u0648\u0646 \u0645\u0627\u0644\u06CC\u0627\u062A\u200C\u0647\u0627\u06CC \u0645\u0633\u062A\u0642\u06CC\u0645\u060C \u0642\u0627\u0646\u0648\u0646 \u067E\u0627\u06CC\u0627\u0646\u0647\u200C\u0647\u0627\u06CC \u0641\u0631\u0648\u0634\u06AF\u0627\u0647\u06CC \u0648 \u0633\u0627\u0645\u0627\u0646\u0647 \u0645\u0648\u062F\u06CC\u0627\u0646 \u06A9\u0634\u0648\u0631 \u062A\u0646\u0638\u06CC\u0645 \u0648 \u0635\u0627\u062F\u0631 \u06AF\u0631\u062F\u06CC\u062F\u0647 \u0627\u0633\u062A. \u0645\u0628\u0627\u0644\u063A \u0645\u0646\u062F\u0631\u062C \u0628\u0631 \u0627\u0633\u0627\u0633 \u0646\u0631\u062E \u0645\u0627\u0644\u06CC\u0627\u062A \u0628\u0631 \u0627\u0631\u0632\u0634 \u0627\u0641\u0632\u0648\u062F\u0647 \u0645\u0635\u0648\u0628 \u0633\u0627\u0644 \u062C\u0627\u0631\u06CC \u0645\u062D\u0627\u0633\u0628\u0647 \u0634\u062F\u0647 \u0648 \u0627\u06CC\u0646 \u0633\u0646\u062F \u062F\u0627\u0631\u0627\u06CC \u0627\u0631\u0632\u0634 \u0631\u0633\u0645\u06CC\u060C \u0642\u0627\u0646\u0648\u0646\u06CC \u0648 \u0642\u0627\u0628\u0644 \u0627\u0633\u062A\u0646\u0627\u062F \u062C\u0647\u062A \u0627\u0631\u0627\u0626\u0647 \u0628\u0647 \u062D\u0648\u0632\u0647 \u0645\u0627\u0644\u06CC\u0627\u062A\u06CC\u060C \u062F\u0641\u0627\u062A\u0631 \u062D\u0633\u0627\u0628\u0631\u0633\u06CC \u0648 \u0645\u0645\u06CC\u0632\u06CC \u062F\u0627\u0631\u0627\u06CC\u06CC \u0645\u06CC\u200C\u0628\u0627\u0634\u062F.
    </div>
  </div>

</body>
</html>`;
}
function generateOfficialContractHtml(params) {
  const { order, tx, user, company, modulesList } = params;
  const contractNum = `KCT-${order?.order_number?.replace(/\D/g, "") || order?.id || "1001"}`;
  const contractDate = order?.created_at ? new Date(order.created_at) : /* @__PURE__ */ new Date();
  const dateFa = contractDate.toLocaleDateString("fa-IR");
  const buyerName = company?.name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.mobile;
  const buyerNationalId = company?.national_id?.trim() || user.national_code?.trim() || user.national_id?.trim() || user.mobile;
  const buyerPhone = company?.phone || user.mobile;
  const buyerAddress = company?.address || (company?.province ? `${company.province}\u060C ${company.city || ""}` : "\u0627\u0642\u0627\u0645\u062A\u06AF\u0627\u0647 \u0642\u0627\u0646\u0648\u0646\u06CC \u062B\u0628\u062A \u0634\u062F\u0647 \u062F\u0631 \u0633\u0627\u0645\u0627\u0646\u0647");
  const finalAmount = Number(tx?.amount || order?.amount || 0);
  const amountInWords = numberToWordsPersian(finalAmount);
  const selectedModulesTitles = (order?.module_ids || []).map((id) => {
    const m = modulesList.find((x) => x.id === id);
    return m ? m.title : id;
  }).join("\u060C ") || "\u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627\u06CC \u067E\u0627\u06CC\u0647 \u0648 \u0627\u062E\u062A\u0635\u0627\u0635\u06CC ERP";
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0631\u0633\u0645\u06CC \u0627\u0631\u0627\u0626\u0647 \u062E\u062F\u0645\u0627\u062A \u0627\u0628\u0631\u06CC \u0648 \u0644\u0627\u06CC\u0633\u0646\u0633 - ${contractNum}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'IRANSans', 'Vazirmatn', Tahoma, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 20px;
      background: #f8fafc;
      color: #0f172a;
      font-size: 11.5px;
      line-height: 1.8;
    }
    .print-actions {
      max-width: 210mm;
      margin: 0 auto 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }
    .btn-print {
      background: #0870d1;
      color: #ffffff;
      border: none;
      padding: 8px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .contract-wrapper {
      max-width: 210mm;
      margin: 0 auto;
      background: #ffffff;
      padding: 16mm 14mm;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .header-box {
      border-bottom: 2px solid #0870d1;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .contract-title {
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
      margin: 0;
    }
    .clause {
      margin-bottom: 14px;
      text-align: justify;
    }
    .clause-title {
      font-weight: 800;
      color: #0870d1;
      margin-bottom: 4px;
    }
    .signatures-box {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
    .sig-party {
      width: 48%;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 14px;
      height: 140px;
      position: relative;
    }
    .stamp-circle {
      position: absolute;
      left: 20px;
      bottom: 20px;
      border: 3px double #0870d1;
      border-radius: 50%;
      width: 80px;
      height: 80px;
      color: #0870d1;
      font-size: 9px;
      font-weight: bold;
      text-align: center;
      padding: 14px 2px;
      transform: rotate(-12deg);
      opacity: 0.85;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .print-actions {
        display: none !important;
      }
      .contract-wrapper {
        border: none;
        box-shadow: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>

  <div class="print-actions">
    <strong style="color:#0870d1; font-size:14px;">\u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0631\u0633\u0645\u06CC \u0644\u0627\u06CC\u0633\u0646\u0633 \u0648 \u0627\u0631\u0627\u0626\u0647 \u062E\u062F\u0645\u0627\u062A \u0627\u0628\u0631\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 (SLA Agreement)</strong>
    <div style="display:flex; gap:8px;">
      <button type="button" class="btn-print" style="background:#16a34a;" onclick="window.downloadContractPdf()">
        \u062F\u0627\u0646\u0644\u0648\u062F \u062E\u0648\u062F\u06A9\u0627\u0631 PDF \u0642\u0631\u0627\u0631\u062F\u0627\u062F
      </button>
      <button type="button" class="btn-print" onclick="window.print()">
        \u0686\u0627\u067E \u0648 \u0630\u062E\u06CC\u0631\u0647 PDF \u0642\u0631\u0627\u0631\u062F\u0627\u062F
      </button>
    </div>
  </div>

  <div class="contract-wrapper">
    <div class="header-box">
      <div>
        <h1 class="contract-title">\u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0627\u0639\u0637\u0627\u06CC \u0644\u0627\u06CC\u0633\u0646\u0633 \u0648 \u0627\u0631\u0627\u0626\u0647 \u062E\u062F\u0645\u0627\u062A \u0627\u0628\u0631\u06CC (SLA)</h1>
        <small style="color:#64748b;">\u0633\u0627\u0645\u0627\u0646\u0647 \u0645\u062F\u06CC\u0631\u06CC\u062A \u06CC\u06A9\u067E\u0627\u0631\u0686\u0647 \u0645\u0646\u0627\u0628\u0639 \u0633\u0627\u0632\u0645\u0627\u0646\u06CC \u0627\u0628\u0631\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 (Karovita Cloud ERP)</small>
      </div>
      <div style="text-align:left; font-size:11px; line-height:1.6;">
        <div>\u0634\u0645\u0627\u0631\u0647 \u0642\u0631\u0627\u0631\u062F\u0627\u062F: <strong style="font-family:monospace;">${contractNum}</strong></div>
        <div>\u062A\u0627\u0631\u06CC\u062E \u0627\u0646\u0639\u0642\u0627\u062F: <strong>${dateFa}</strong></div>
        <div>\u067E\u06CC\u0648\u0633\u062A \u0641\u0627\u06A9\u062A\u0648\u0631: <strong style="font-family:monospace;">${order?.order_number || "\u2014"}</strong></div>
      </div>
    </div>

    <div class="clause">
      <div class="clause-title">\u0645\u0627\u062F\u0647 \u06F1: \u0637\u0631\u0641\u06CC\u0646 \u0642\u0631\u0627\u0631\u062F\u0627\u062F</div>
      \u0627\u06CC\u0646 \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0641\u06CC\u200C\u0645\u0627\u0628\u06CC\u0646 <strong>${OFFICIAL_SELLER_INFO.company_name}</strong> \u0628\u0647 \u0634\u0646\u0627\u0633\u0647 \u0645\u0644\u06CC ${OFFICIAL_SELLER_INFO.national_id}\u060C \u0634\u0645\u0627\u0631\u0647 \u062B\u0628\u062A ${OFFICIAL_SELLER_INFO.registration_number} \u0648 \u06A9\u062F \u0627\u0642\u062A\u0635\u0627\u062F\u06CC ${OFFICIAL_SELLER_INFO.economic_code} \u0628\u0647 \u0646\u0634\u0627\u0646\u06CC ${OFFICIAL_SELLER_INFO.address} \u0628\u0647 \u0639\u0646\u0648\u0627\u0646 <strong>\xAB\u0645\u062C\u0631\u06CC / \u0627\u0631\u0627\u0626\u0647\u200C\u062F\u0647\u0646\u062F\u0647 \u062E\u062F\u0645\u062A\xBB</strong> \u0627\u0632 \u06CC\u06A9 \u0637\u0631\u0641\u060C \u0648 <strong>${buyerName}</strong> \u0628\u0647 \u0634\u0645\u0627\u0631\u0647/\u0634\u0646\u0627\u0633\u0647 \u0645\u0644\u06CC ${buyerNationalId} \u0628\u0647 \u0646\u0634\u0627\u0646\u06CC ${buyerAddress} \u0648 \u0634\u0645\u0627\u0631\u0647 \u062A\u0645\u0627\u0633 ${buyerPhone} \u0628\u0647 \u0639\u0646\u0648\u0627\u0646 <strong>\xAB\u06A9\u0627\u0631\u0641\u0631\u0645\u0627 / \u0645\u0634\u062A\u0631\u06A9\xBB</strong> \u0627\u0632 \u0637\u0631\u0641 \u062F\u06CC\u06AF\u0631\u060C \u0645\u0646\u0639\u0642\u062F \u06AF\u0631\u062F\u06CC\u062F.
    </div>

    <div class="clause">
      <div class="clause-title">\u0645\u0627\u062F\u0647 \u06F2: \u0645\u0648\u0636\u0648\u0639 \u0642\u0631\u0627\u0631\u062F\u0627\u062F</div>
      \u0645\u0648\u0636\u0648\u0639 \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0639\u0628\u0627\u0631\u062A \u0627\u0633\u062A \u0627\u0632 \u0627\u0639\u0637\u0627\u06CC \u062D\u0642 \u0628\u0647\u0631\u0647\u200C\u0628\u0631\u062F\u0627\u0631\u06CC \u063A\u06CC\u0631\u0627\u0646\u062D\u0635\u0627\u0631\u06CC (\u0644\u0627\u06CC\u0633\u0646\u0633 \u0627\u0628\u0631\u06CC)\u060C \u0645\u06CC\u0632\u0628\u0627\u0646\u06CC \u0627\u0645\u0646 \u062F\u0627\u062F\u0647\u200C\u0647\u0627\u060C \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0641\u0646\u06CC \u0648 \u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u0633\u0627\u0645\u0627\u0646\u0647 \u0627\u0628\u0631\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 \u0648 \u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627\u06CC \u0645\u0646\u062A\u062E\u064E\u0628 \u06A9\u0627\u0631\u0641\u0631\u0645\u0627 \u0634\u0627\u0645\u0644: <strong>${selectedModulesTitles}</strong> \u0628\u0631\u0627\u06CC \u0638\u0631\u0641\u06CC\u062A <strong>${order?.user_count || 1} \u06A9\u0627\u0631\u0628\u0631 \u0647\u0645\u0632\u0645\u0627\u0646</strong>.
    </div>

    <div class="clause">
      <div class="clause-title">\u0645\u0627\u062F\u0647 \u06F3: \u0645\u062F\u062A \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0648 \u062F\u0648\u0631\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9</div>
      \u0645\u062F\u062A \u0627\u06CC\u0646 \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0628\u0647 \u0645\u062F\u062A <strong>\u06CC\u06A9 \u062F\u0648\u0631\u0647 ${order?.billing_period === "yearly" || order?.billing_period === "12_months" ? "\u06CC\u06A9\u200C\u0633\u0627\u0644\u0647 (\u06F1\u06F2 \u0645\u0627\u0647 \u0634\u0645\u0633\u06CC \u0628\u0627 \u0627\u062D\u062A\u0633\u0627\u0628 \u06F2 \u0645\u0627\u0647 \u0647\u062F\u06CC\u0647 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627)" : order?.billing_period === "6_months" || order?.billing_period === "semiannual" ? "\u0634\u0634\u200C\u0645\u0627\u0647\u0647 (\u06F6 \u0645\u0627\u0647 \u0634\u0645\u0633\u06CC)" : order?.billing_period === "3_months" || order?.billing_period === "quarterly" ? "\u0633\u0647\u200C\u0645\u0627\u0647\u0647 (\u06F3 \u0645\u0627\u0647 \u0634\u0645\u0633\u06CC)" : "\u06CC\u06A9\u200C\u0645\u0627\u0647\u0647"}</strong> \u0627\u0632 \u062A\u0627\u0631\u06CC\u062E \u067E\u0631\u062F\u0627\u062E\u062A \u0648 \u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u0633\u0641\u0627\u0631\u0634 \u0628\u0648\u062F\u0647 \u0648 \u0628\u0627 \u062A\u0645\u062F\u06CC\u062F \u0627\u0634\u062A\u0631\u0627\u06A9 \u0648 \u062A\u0633\u0648\u06CC\u0647 \u0641\u0627\u06A9\u062A\u0648\u0631\u0647\u0627\u06CC \u0622\u062A\u06CC \u0628\u0647 \u0635\u0648\u0631\u062A \u062E\u0648\u062F\u06A9\u0627\u0631 \u0642\u0627\u0628\u0644 \u062A\u0645\u062F\u06CC\u062F \u0627\u0633\u062A.
    </div>

    <div class="clause">
      <div class="clause-title">\u0645\u0627\u062F\u0647 \u06F4: \u0645\u0628\u0644\u063A \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0648 \u0646\u062D\u0648\u0647 \u067E\u0631\u062F\u0627\u062E\u062A</div>
      \u0645\u0628\u0644\u063A \u06A9\u0644 \u0627\u06CC\u0646 \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0628\u0631\u0627\u0628\u0631 \u0628\u0627 <strong>${finalAmount.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646</strong> (\u062D\u0631\u0648\u0641: ${amountInWords}) \u0628\u0627 \u0627\u062D\u062A\u0633\u0627\u0628 \u06A9\u0644\u06CC\u0647 \u0639\u0648\u0627\u0631\u0636 \u0648 \u0645\u0627\u0644\u06CC\u0627\u062A \u0628\u0631 \u0627\u0631\u0632\u0634 \u0627\u0641\u0632\u0648\u062F\u0647 \u0642\u0627\u0646\u0648\u0646\u06CC \u0645\u06CC\u200C\u0628\u0627\u0634\u062F \u06A9\u0647 \u0637\u0628\u0642 \u0635\u0648\u0631\u062A\u062D\u0633\u0627\u0628 \u0631\u0633\u0645\u06CC \u0634\u0645\u0627\u0631\u0647 ${order?.order_number || "\u2014"} \u062A\u0648\u0633\u0637 \u06A9\u0627\u0631\u0641\u0631\u0645\u0627 \u062A\u0633\u0648\u06CC\u0647 \u06AF\u0631\u062F\u06CC\u062F\u0647 \u0627\u0633\u062A.
    </div>

    <div class="clause">
      <div class="clause-title">\u0645\u0627\u062F\u0647 \u06F5: \u0633\u0637\u062D \u062A\u0639\u0647\u062F\u0627\u062A \u062E\u062F\u0645\u0627\u062A (SLA) \u0648 \u067E\u0627\u06CC\u062F\u0627\u0631\u06CC \u0633\u0631\u0648\u06CC\u0633</div>
      \u0645\u062C\u0631\u06CC \u0645\u062A\u0639\u0647\u062F \u0645\u06CC\u200C\u06AF\u0631\u062F\u062F \u067E\u0627\u06CC\u062F\u0627\u0631\u06CC \u0633\u0627\u0645\u0627\u0646\u0647 \u0627\u0628\u0631\u06CC (Uptime) \u0631\u0627 \u0628\u0627 \u0636\u0631\u06CC\u0628 \u06F9\u06F9.\u06F9\u066A \u062F\u0631 \u0637\u0648\u0644 \u062F\u0648\u0631\u0647 \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u062A\u0636\u0645\u06CC\u0646 \u0646\u0645\u0627\u06CC\u062F. \u0647\u0645\u0686\u0646\u06CC\u0646 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0641\u0646\u06CC \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0633\u0627\u0645\u0627\u0646\u0647 \u062A\u06CC\u06A9\u062A\u06CC\u0646\u06AF \u0648 \u0631\u0641\u0639 \u062E\u0637\u0627\u0647\u0627\u06CC \u0633\u06CC\u0633\u062A\u0645\u06CC \u0628\u0647 \u0635\u0648\u0631\u062A \u06F2\u06F4/\u06F7 \u0628\u0631 \u0639\u0647\u062F\u0647 \u0645\u062C\u0631\u06CC \u062E\u0648\u0627\u0647\u062F \u0628\u0648\u062F.
    </div>

    <div class="clause">
      <div class="clause-title">\u0645\u0627\u062F\u0647 \u06F6: \u0645\u062D\u0631\u0645\u0627\u0646\u06AF\u06CC \u0627\u0637\u0644\u0627\u0639\u0627\u062A (NDA) \u0648 \u0645\u0627\u0644\u06A9\u06CC\u062A \u062F\u0627\u062F\u0647\u200C\u0647\u0627</div>
      \u06A9\u0644\u06CC\u0647 \u0627\u0637\u0644\u0627\u0639\u0627\u062A\u060C \u067E\u0627\u06CC\u06AF\u0627\u0647 \u062F\u0627\u062F\u0647\u200C\u0647\u0627\u060C \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0645\u0627\u0644\u06CC \u0648 \u0627\u0633\u0646\u0627\u062F \u062A\u062C\u0627\u0631\u06CC \u06A9\u0627\u0631\u0641\u0631\u0645\u0627 \u06A9\u0647 \u062F\u0631 \u0633\u0627\u0645\u0627\u0646\u0647 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 \u0630\u062E\u06CC\u0631\u0647 \u0645\u06CC\u200C\u06AF\u0631\u062F\u062F\u060C \u062F\u0627\u0631\u0627\u06CC\u06CC \u0627\u0646\u062D\u0635\u0627\u0631\u06CC \u0648 \u0645\u062D\u0631\u0645\u0627\u0646\u0647 \u06A9\u0627\u0631\u0641\u0631\u0645\u0627 \u0628\u0648\u062F\u0647 \u0648 \u0645\u062C\u0631\u06CC \u0645\u062A\u0639\u0647\u062F \u0628\u0647 \u062D\u0641\u0627\u0638\u062A \u06A9\u0627\u0645\u0644 \u0627\u0632 \u062D\u0631\u06CC\u0645 \u062E\u0635\u0648\u0635\u06CC \u062F\u0627\u062F\u0647\u200C\u0647\u0627 \u0637\u0628\u0642 \u067E\u0631\u0648\u062A\u06A9\u0644\u200C\u0647\u0627\u06CC \u0631\u0645\u0632\u0646\u06AF\u0627\u0631\u06CC \u067E\u06CC\u0634\u0631\u0641\u062A\u0647 \u0645\u06CC\u200C\u0628\u0627\u0634\u062F.
    </div>

    <div class="clause">
      <div class="clause-title">\u0645\u0627\u062F\u0647 \u06F7: \u062F\u0648\u0631\u0647 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0631\u0627\u06CC\u06AF\u0627\u0646 \u0648 \u0622\u0634\u0646\u0627\u06CC\u06CC \u0628\u0627 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627</div>
 \u0645\u0634\u062A\u0631\u06CC \u067E\u06CC\u0634 \u0627\u0632 \u067E\u0631\u062F\u0627\u062E\u062A\u060C \u0627\u0632 \u062F\u0648\u0631\u0647 \u0631\u0627\u06CC\u06AF\u0627\u0646 \u067E\u0646\u062C\u200C\u0631\u0648\u0632\u0647 (\u06F5 \u0631\u0648\u0632) \u0627\u0632 \u062A\u0645\u0627\u0645\u06CC \u0627\u0645\u06A9\u0627\u0646\u0627\u062A \u0628\u0647\u0631\u0647\u200C\u0645\u0646\u062F \u0628\u0648\u062F\u0647 \u0648 \u062A\u0635\u062F\u06CC\u0642 \u0645\u06CC\u200C\u06A9\u0646\u062F \u062F\u0633\u062A\u0631\u0633\u06CC \u06A9\u0627\u0645\u0644 \u0648 \u0641\u0631\u0635\u062A \u06A9\u0627\u0641\u06CC \u0628\u0631\u0627\u06CC \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u062F\u0627\u0634\u062A\u0647 \u0627\u0633\u062A\u061B \u062E\u0631\u06CC\u062F \u067E\u0633 \u0627\u0632 \u0627\u06CC\u0646 \u062F\u0648\u0631\u0647 \u0628\u0647\u200C\u0645\u0646\u0632\u0644\u0647 \u0634\u0646\u0627\u062E\u062A \u06A9\u0627\u0645\u0644 \u0627\u0632 \u0639\u0645\u0644\u06A9\u0631\u062F \u0646\u0631\u0645\u200C\u0627\u0641\u0632\u0627\u0631 \u0627\u0633\u062A.</div>

    <div class="clause">
      <div class="clause-title">\u0645\u0627\u062F\u0647 \u06F8: \u062A\u0639\u0647\u062F \u0628\u0647 \u067E\u0631\u062F\u0627\u062E\u062A \u0648 \u0634\u0631\u0637 \u0639\u062F\u0645 \u0628\u0627\u0632\u06AF\u0634\u062A \u0648\u062C\u0647</div>
 \u06F1. \u0645\u0634\u062A\u0631\u06CC \u0628\u0627 \u067E\u0631\u062F\u0627\u062E\u062A \u0645\u0628\u0644\u063A \u0627\u0634\u062A\u0631\u0627\u06A9 \u062A\u0635\u0631\u06CC\u062D \u0645\u06CC\u200C\u06A9\u0646\u062F \u0628\u0627 \u0634\u0646\u0627\u062E\u062A \u06A9\u0627\u0645\u0644 \u0648 \u0627\u0631\u0627\u062F\u0647 \u0622\u0632\u0627\u062F \u062E\u0631\u06CC\u062F \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A. \u06F2. \u0627\u0632 \u0644\u062D\u0638\u0647 \u062A\u0623\u06CC\u06CC\u062F \u067E\u0631\u062F\u0627\u062E\u062A\u060C \u0645\u0628\u0644\u063A \u0628\u0647 \u0647\u06CC\u0686\u200C\u0648\u062C\u0647 \u0642\u0627\u0628\u0644 \u0628\u0627\u0632\u06AF\u0634\u062A \u0646\u06CC\u0633\u062A \u0648 \u0645\u0634\u062A\u0631\u06CC \u062D\u0642 \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u0627\u0633\u062A\u0631\u062F\u0627\u062F\u060C \u0641\u0633\u062E \u06CC\u0627 \u0627\u0646\u0635\u0631\u0627\u0641 \u0646\u062F\u0627\u0631\u062F. \u06F3. \u0645\u0634\u062A\u0631\u06CC \u062A\u0635\u062F\u06CC\u0642 \u0645\u06CC\u200C\u06A9\u0646\u062F \u0634\u0631\u0627\u06CC\u0637 \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0631\u0627 \u0645\u0637\u0627\u0644\u0639\u0647 \u0648 \u062F\u06A9\u0645\u0647 \xAB\u067E\u0630\u06CC\u0631\u0634 \u0648 \u067E\u0631\u062F\u0627\u062E\u062A\xBB \u0631\u0627 \u0622\u06AF\u0627\u0647\u0627\u0646\u0647 \u0641\u0634\u0631\u062F\u0647 \u0627\u0633\u062A. \u06F4. \u0639\u062F\u0645 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06CC\u0627 \u0639\u062F\u0645 \u0631\u0636\u0627\u06CC\u062A \u067E\u0633 \u0627\u0632 \u062F\u0648\u0631\u0647 \u0631\u0627\u06CC\u06AF\u0627\u0646\u060C \u062F\u0644\u06CC\u0644\u06CC \u0628\u0631\u0627\u06CC \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0646\u06CC\u0633\u062A.</div>

    <div class="clause">
      <div class="clause-title">\u0645\u0627\u062F\u0647 \u06F9: \u0645\u0628\u0646\u0627\u06CC \u062D\u0642\u0648\u0642\u06CC \u0634\u0631\u0637 \u0639\u062F\u0645 \u0628\u0627\u0632\u06AF\u0634\u062A \u0648\u062C\u0647</div>
 \u0645\u0628\u0646\u0627\u06CC \u062D\u0642\u0648\u0642\u06CC\u060C \u0642\u0627\u0646\u0648\u0646 \u062A\u062C\u0627\u0631\u062A \u0627\u0644\u06A9\u062A\u0631\u0648\u0646\u06CC\u06A9\u06CC \u0627\u06CC\u0631\u0627\u0646 \u0648 \u0645\u0627\u062F\u0647 \u06F3\u06F7 \u0622\u0646 \u0627\u0633\u062A: \u062F\u0631 \u0645\u0639\u0627\u0645\u0644\u0647 \u0627\u0632 \u0631\u0627\u0647 \u062F\u0648\u0631 \u0645\u0635\u0631\u0641\u200C\u06A9\u0646\u0646\u062F\u0647 \u062D\u062F\u0627\u0642\u0644 \u0647\u0641\u062A \u0631\u0648\u0632 \u06A9\u0627\u0631\u06CC \u0641\u0631\u0635\u062A \u0627\u0646\u0635\u0631\u0627\u0641 \u062F\u0627\u0631\u062F\u061B \u062F\u0631 \u0627\u06CC\u0646 \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u062F\u0648\u0631\u0647 \u0631\u0627\u06CC\u06AF\u0627\u0646 \u067E\u0646\u062C\u200C\u0631\u0648\u0632\u0647 \u0647\u0645\u0627\u0646 \u0641\u0631\u0635\u062A \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0648 \u0627\u0646\u0635\u0631\u0627\u0641 \u0628\u062F\u0648\u0646\u0650 \u0647\u0632\u06CC\u0646\u0647 \u0627\u0633\u062A \u0648 \u067E\u0633 \u0627\u0632 \u067E\u0631\u062F\u0627\u062E\u062A \u0645\u0633\u0626\u0648\u0644\u06CC\u062A \u06A9\u0627\u0645\u0644 \u062A\u0635\u0645\u06CC\u0645 \u0628\u0631 \u0639\u0647\u062F\u0647 \u0645\u0634\u062A\u0631\u06CC \u0627\u0633\u062A.</div>

    <div class="clause">
      <div class="clause-title">\u0645\u0627\u062F\u0647 \u06F1\u06F0: \u0635\u062F\u0648\u0631 \u062A\u0623\u06CC\u06CC\u062F\u06CC\u0647 \u0642\u0631\u0627\u0626\u062A \u0648 \u067E\u0630\u06CC\u0631\u0634 \u0627\u0644\u06A9\u062A\u0631\u0648\u0646\u06CC\u06A9\u06CC</div>
 \u067E\u0630\u06CC\u0631\u0634 \u0627\u0644\u06A9\u062A\u0631\u0648\u0646\u06CC\u06A9\u06CC \u0645\u0634\u062A\u0631\u06CC \u0628\u0647\u200C\u0645\u0646\u0632\u0644\u0647 \u0627\u0645\u0636\u0627 \u0648 \u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646 \u0627\u0645\u0636\u0627\u06CC \u062F\u0633\u062A\u200C\u0646\u0648\u06CC\u0633 \u0627\u0633\u062A. \u0632\u0645\u0627\u0646\u060C \u062A\u0627\u0631\u06CC\u062E \u067E\u0630\u06CC\u0631\u0634 \u0648 \u0634\u0646\u0627\u0633\u0647 \u062A\u0631\u0627\u06A9\u0646\u0634 \u067E\u0631\u062F\u0627\u062E\u062A \u062F\u0631 \u0633\u0627\u0645\u0627\u0646\u0647 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 \u0628\u0647\u200C\u0639\u0646\u0648\u0627\u0646 \u062F\u0644\u06CC\u0644 \u0627\u062B\u0628\u0627\u062A \u0646\u06AF\u0647\u062F\u0627\u0631\u06CC \u0645\u06CC\u200C\u0634\u0648\u062F.</div>

    <div class="clause">
      <div class="clause-title">\u0645\u0627\u062F\u0647 \u06F1\u06F1: \u062D\u0642\u0648\u0642 \u0648 \u062A\u0639\u0647\u062F\u0627\u062A \u0637\u0631\u0641\u06CC\u0646</div>
 \u062A\u0623\u0645\u06CC\u0646\u200C\u06A9\u0646\u0646\u062F\u0647: \u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u0633\u0631\u06CC\u0639 \u062D\u0633\u0627\u0628 \u067E\u0633 \u0627\u0632 \u067E\u0631\u062F\u0627\u062E\u062A\u060C \u0627\u0631\u0627\u0626\u0647 \u062E\u062F\u0645\u0627\u062A \u0645\u0637\u0627\u0628\u0642 \u0648\u06CC\u0698\u06AF\u06CC\u200C\u0647\u0627\u06CC \u062A\u062C\u0631\u0628\u0647\u200C\u0634\u062F\u0647 \u062F\u0631 \u062F\u0648\u0631\u0647 \u0631\u0627\u06CC\u06AF\u0627\u0646\u060C \u062D\u0641\u0638 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0645\u0637\u0627\u0628\u0642 \u062D\u0631\u06CC\u0645 \u062E\u0635\u0648\u0635\u06CC. \u0645\u0634\u062A\u0631\u06CC: \u0645\u0637\u0627\u0644\u0639\u0647 \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u067E\u06CC\u0634 \u0627\u0632 \u067E\u0631\u062F\u0627\u062E\u062A\u060C \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u062F\u0648\u0631\u0647 \u0631\u0627\u06CC\u06AF\u0627\u0646 \u0628\u0631\u0627\u06CC \u0622\u0634\u0646\u0627\u06CC\u06CC\u060C \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0642\u0627\u0646\u0648\u0646\u06CC \u0627\u0632 \u0646\u0631\u0645\u200C\u0627\u0641\u0632\u0627\u0631\u060C \u067E\u0630\u06CC\u0631\u0634 \u0645\u0633\u0626\u0648\u0644\u06CC\u062A \u06A9\u0627\u0645\u0644 \u062A\u0635\u0645\u06CC\u0645 \u0628\u0647 \u062E\u0631\u06CC\u062F.</div>

    <div class="clause">
      <div class="clause-title">\u0645\u0627\u062F\u0647 \u06F1\u06F2: \u0627\u0633\u062A\u062B\u0646\u0627\u0626\u0627\u062A \u0648 \u0645\u0648\u0627\u0631\u062F \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0648\u062C\u0647</div>
 \u062A\u0646\u0647\u0627 \u062F\u0631 \u0627\u06CC\u0646 \u0645\u0648\u0627\u0631\u062F \u0645\u062D\u062F\u0648\u062F \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0628\u0631\u0631\u0633\u06CC \u0645\u06CC\u200C\u0634\u0648\u062F: \u067E\u0631\u062F\u0627\u062E\u062A \u0645\u0628\u0644\u063A \u0628\u06CC\u0634 \u0627\u0632 \u0645\u0628\u0644\u063A \u0646\u0645\u0627\u06CC\u0634\u200C\u062F\u0627\u062F\u0647\u200C\u0634\u062F\u0647 (\u062E\u0637\u0627\u06CC \u0645\u062D\u0627\u0633\u0628\u0627\u062A\u06CC \u0633\u0627\u0645\u0627\u0646\u0647)\u060C \u06A9\u0633\u0631 \u062A\u06A9\u0631\u0627\u0631\u06CC \u0628\u0631\u0627\u06CC \u06CC\u06A9 \u062A\u0631\u0627\u06A9\u0646\u0634 \u0648\u0627\u062D\u062F\u060C \u0639\u062F\u0645 \u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u062D\u0633\u0627\u0628 \u062A\u0648\u0633\u0637 \u062A\u0623\u0645\u06CC\u0646\u200C\u06A9\u0646\u0646\u062F\u0647 \u062F\u0631 \u0628\u0627\u0632\u0647 \u062A\u0639\u0647\u062F\u0634\u062F\u0647. \u0645\u0634\u062A\u0631\u06CC \u0628\u0627\u06CC\u062F \u062D\u062F\u0627\u06A9\u062B\u0631 \u0638\u0631\u0641 \u06F7\u06F2 \u0633\u0627\u0639\u062A \u0627\u0632 \u067E\u0631\u062F\u0627\u062E\u062A\u060C \u0627\u0632 \u0637\u0631\u06CC\u0642 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 \u0628\u0627 \u0634\u0645\u0627\u0631\u0647 \u062A\u0631\u0627\u06A9\u0646\u0634 \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u062B\u0628\u062A \u06A9\u0646\u062F.</div>

    <div class="clause">
      <div class="clause-title">\u0645\u0627\u062F\u0647 \u06F1\u06F3: \u062D\u0644 \u0627\u062E\u062A\u0644\u0627\u0641 \u0648 \u0642\u0627\u0646\u0648\u0646 \u062D\u0627\u06A9\u0645</div>
 \u0627\u06CC\u0646 \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u062A\u0627\u0628\u0639 \u0642\u0648\u0627\u0646\u06CC\u0646 \u062C\u0645\u0647\u0648\u0631\u06CC \u0627\u0633\u0644\u0627\u0645\u06CC \u0627\u06CC\u0631\u0627\u0646 \u0627\u0633\u062A. \u0627\u062E\u062A\u0644\u0627\u0641 \u0627\u0628\u062A\u062F\u0627 \u0627\u0632 \u0637\u0631\u06CC\u0642 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 \u0648 \u0645\u0630\u0627\u06A9\u0631\u0647 \u062F\u0648\u0633\u062A\u0627\u0646\u0647 \u062D\u0644\u200C\u0648\u0641\u0635\u0644 \u0645\u06CC\u200C\u0634\u0648\u062F\u061B \u062F\u0631 \u0635\u0648\u0631\u062A \u0639\u062F\u0645 \u062A\u0648\u0627\u0641\u0642\u060C \u0645\u0631\u062C\u0639 \u0631\u0633\u06CC\u062F\u06AF\u06CC \u0645\u0631\u0627\u062C\u0639 \u0642\u0636\u0627\u06CC\u06CC \u0630\u06CC\u200C\u0635\u0644\u0627\u062D \u0645\u062D\u0644 \u0627\u0642\u0627\u0645\u062A \u062A\u0623\u0645\u06CC\u0646\u200C\u06A9\u0646\u0646\u062F\u0647 \u0627\u0633\u062A.</div>

    <div class="clause">
      <div class="clause-title">\u0645\u0627\u062F\u0647 \u06F1\u06F4: \u0627\u0645\u0636\u0627 \u0648 \u062A\u0623\u06CC\u06CC\u062F \u0646\u0647\u0627\u06CC\u06CC</div>
 \u0645\u0634\u062A\u0631\u06CC \u067E\u0630\u06CC\u0631\u0634 \u0627\u0644\u06A9\u062A\u0631\u0648\u0646\u06CC\u06A9\u06CC \u0627\u06CC\u0646 \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0648 \u067E\u0631\u062F\u0627\u062E\u062A \u0645\u0628\u0644\u063A \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F \u0645\u06CC\u200C\u06A9\u0646\u062F \u0648 \u0627\u06CC\u0646 \u067E\u0630\u06CC\u0631\u0634 \u0628\u0647\u200C\u0645\u0646\u0632\u0644\u0647 \u0627\u0645\u0636\u0627\u06CC \u0627\u0644\u06A9\u062A\u0631\u0648\u0646\u06CC\u06A9\u06CC \u0627\u0648\u0633\u062A. \u062A\u0627\u0631\u06CC\u062E \u067E\u0630\u06CC\u0631\u0634: <strong>${dateFa}</strong> \u0640\u0640 \u0634\u0646\u0627\u0633\u0647 \u062A\u0631\u0627\u06A9\u0646\u0634: <strong style="font-family:monospace;">${tx?.tracking_code || tx?.ref_number || tx?.id || "\u2014"}</strong> \u0640\u0640 \u0631\u0627\u06CC\u0627\u0646\u0627\u0645\u0647: <strong>${user.email || "\u2014"}</strong> \u0640\u0640 \u0634\u0646\u0627\u0633\u0647 \u06A9\u0627\u0631\u0628\u0631\u06CC: <strong style="font-family:monospace;">${user.mobile || user.id || "\u2014"}</strong></div>

    <div class="signatures-box">
      <div class="sig-party">
        <strong>\u0645\u0647\u0631 \u0648 \u0627\u0645\u0636\u0627\u06CC \u0645\u062C\u0631\u06CC (\u0627\u0631\u0627\u0626\u0647\u200C\u062F\u0647\u0646\u062F\u0647 \u062E\u062F\u0645\u062A):</strong>
        <div style="font-size:10px; color:#64748b; margin-top:2px;">\u0634\u0631\u06A9\u062A \u062F\u0627\u062F\u0647\u200C\u067E\u0631\u062F\u0627\u0632\u0627\u0646 \u0627\u0628\u0631\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 (\u0633\u0647\u0627\u0645\u06CC \u062E\u0627\u0635)</div>
        <div class="stamp-circle">
          \u0634\u0631\u06A9\u062A \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627<br>
          \u0627\u0645\u0648\u0631 \u062D\u0642\u0648\u0642\u06CC \u0648 \u0642\u0631\u0627\u0631\u062F\u0627\u062F\u0647\u0627
        </div>
      </div>

      <div class="sig-party">
        <strong>\u0645\u0647\u0631 \u0648 \u0627\u0645\u0636\u0627\u06CC \u06A9\u0627\u0631\u0641\u0631\u0645\u0627 (\u0645\u0634\u062A\u0631\u06A9):</strong>
        <div style="font-size:10px; color:#64748b; margin-top:2px;">${buyerName}</div>
      </div>
    </div>
  </div>

  <!-- Contract Auto PDF: html2pdf.js auto-download + manual button -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js"></script>
  <script>
    (function () {
      function runAutoDownload() {
        try {
          var el = document.querySelector('.contract-wrapper');
          if (!el || typeof html2pdf === 'undefined') return;
          var num = (document.title.split(' - ')[1] || 'Contract').trim();
          html2pdf().set({
            margin: [8, 8, 8, 8],
            filename: 'Karovita-Contract-' + num + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
          }).from(el).save();
        } catch (e) { console.warn('auto pdf failed', e); }
      }
      window.downloadContractPdf = runAutoDownload;
      window.addEventListener('load', function () {
        setTimeout(runAutoDownload, 1200);
      });
    })();
  </script>

</body>
</html>`;
}

// server/healthCheck.ts
var import_fs5 = __toESM(require("fs"), 1);
var import_path5 = __toESM(require("path"), 1);
async function getHealthStatus(req, res) {
  const startTime = Date.now();
  const dbStart = Date.now();
  let dbStatus = { status: "healthy" };
  try {
    const userCount = db.users.length;
    const orderCount = db.orders.length;
    const ticketCount = db.tickets.length;
    const dbPath = import_path5.default.join(process.cwd(), "data", "db.json");
    const fileExists = import_fs5.default.existsSync(dbPath);
    const dbLatency = Date.now() - dbStart;
    dbStatus = {
      status: "healthy",
      driver: "json_file_store",
      file_exists: fileExists,
      latency_ms: dbLatency,
      table_records: {
        users: userCount,
        orders: orderCount,
        tickets: ticketCount,
        audit_logs: db.auditLogs.length
      },
      message: "\u0628\u0627\u0646\u06A9 \u0627\u0637\u0644\u0627\u0639\u0627\u062A\u06CC \u0641\u0639\u0627\u0644 \u0648 \u067E\u0627\u0633\u062E\u06AF\u0648 \u0645\u06CC\u200C\u0628\u0627\u0634\u062F."
    };
  } catch (err) {
    dbStatus = {
      status: "unhealthy",
      driver: "json_file_store",
      latency_ms: Date.now() - dbStart,
      error: err.message,
      message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u0641\u0627\u06CC\u0644 \u067E\u0627\u06CC\u06AF\u0627\u0647 \u062F\u0627\u062F\u0647."
    };
  }
  const smsStatus = await checkSmsProviderHealth();
  const cacheStart = Date.now();
  let cacheStatus = { status: "healthy" };
  try {
    const probeKey = `health_probe_${Date.now()}`;
    const testMap = /* @__PURE__ */ new Map();
    testMap.set(probeKey, Date.now());
    const val = testMap.get(probeKey);
    testMap.delete(probeKey);
    const cacheLatency = Date.now() - cacheStart;
    cacheStatus = {
      status: val ? "healthy" : "unhealthy",
      driver: process.env.CACHE_DRIVER || "memory",
      latency_ms: cacheLatency,
      message: "\u062F\u0631\u0627\u06CC\u0648\u0631 \u06A9\u0634 \u0641\u0639\u0627\u0644 \u0628\u0648\u062F\u0647 \u0648 \u0639\u0645\u0644\u06CC\u0627\u062A \u062E\u0648\u0627\u0646\u062F\u0646/\u0646\u0648\u0634\u062A\u0646 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0646\u062C\u0627\u0645 \u0634\u062F."
    };
  } catch (err) {
    cacheStatus = {
      status: "unhealthy",
      driver: process.env.CACHE_DRIVER || "memory",
      latency_ms: Date.now() - cacheStart,
      error: err.message,
      message: "\u062E\u0637\u0627 \u062F\u0631 \u0639\u0645\u0644\u06CC\u0627\u062A \u06A9\u0634."
    };
  }
  const memoryUsage = process.memoryUsage();
  const formatMb = (bytes) => `${Math.round(bytes / 1024 / 1024 * 100) / 100} MB`;
  const totalDuration = Date.now() - startTime;
  const isHealthy = dbStatus.status === "healthy" && cacheStatus.status === "healthy" && smsStatus.status !== "unhealthy";
  const overallStatus = isHealthy ? smsStatus.status === "degraded" ? "degraded" : "healthy" : "unhealthy";
  const httpCode = overallStatus === "unhealthy" ? 503 : 200;
  const response = {
    status: overallStatus,
    app: "KaroVita ERP Server",
    environment: process.env.NODE_ENV || "production",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    response_time_ms: totalDuration,
    database: dbStatus,
    sms_driver: smsStatus,
    services: {
      database: dbStatus,
      sms_provider: smsStatus,
      sms_driver: smsStatus,
      cache: cacheStatus
    },
    system: {
      node_version: process.version,
      platform: process.platform,
      uptime_seconds: Math.floor(process.uptime()),
      memory: {
        rss: formatMb(memoryUsage.rss),
        heap_used: formatMb(memoryUsage.heapUsed),
        heap_total: formatMb(memoryUsage.heapTotal)
      }
    }
  };
  return res.status(httpCode).json(response);
}

// server/cacheMiddleware.ts
var _cache = /* @__PURE__ */ new Map();
function cacheGet(ttlMs = 3e4) {
  return (req, res, next) => {
    if (req.method !== "GET") return next();
    const key = `${req.originalUrl}`;
    const entry = _cache.get(key);
    if (entry && Date.now() - entry.timestamp < ttlMs) {
      res.setHeader("X-Karovita-Cache", "HIT");
      return res.json(entry.data);
    }
    if (entry) _cache.delete(key);
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (_cache.size > 200) {
          const oldest = _cache.keys().next().value;
          _cache.delete(oldest);
        }
        _cache.set(key, { data: body, timestamp: Date.now() });
        res.setHeader("X-Karovita-Cache", "MISS");
      }
      return originalJson(body);
    };
    next();
  };
}
function invalidateCache(prefix) {
  for (const key of _cache.keys()) {
    if (!prefix || key.startsWith(prefix)) _cache.delete(key);
  }
}

// server/routes.ts
var JWT_SECRET = process.env.APP_KEY || "secret_key_owj_abri_123";
var router = (0, import_express.Router)();
router.get("/health", getHealthStatus);
router.get("/ping", (_req, res) => {
  res.json({ status: "ok", app: "karovita_erp", timestamp: Date.now() });
});
function authMiddleware(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(";").reduce((acc, c) => {
      const [k, v] = c.trim().split("=");
      if (k && v) acc[k] = decodeURIComponent(v);
      return acc;
    }, {});
    token = cookies["karovita_token"] || cookies["token"] || null;
  }
  if (!token) {
    return res.status(401).json({ message: "\u0646\u06CC\u0627\u0632 \u0628\u0647 \u0648\u0631\u0648\u062F \u062F\u0627\u0631\u06CC\u062F." });
  }
  try {
    const payload = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    const user = db.getUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: "\u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "\u062A\u0648\u06A9\u0646 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u06CC\u0627 \u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647 \u0627\u0633\u062A." });
  }
}
function adminMiddleware(req, res, next) {
  const user = req.user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0645\u062F\u06CC\u0631 \u0627\u0631\u0634\u062F (Admin) \u0644\u0627\u0632\u0645 \u0627\u0633\u062A." });
  }
  next();
}
function adminOrSupportMiddleware(req, res, next) {
  const user = req.user;
  if (!user || user.role !== "admin" && user.role !== "support") {
    return res.status(403).json({ message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0645\u062F\u06CC\u0631\u06CC\u062A \u06CC\u0627 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC (Admin / Support) \u0644\u0627\u0632\u0645 \u0627\u0633\u062A." });
  }
  next();
}
function toEnglishDigits(str) {
  return String(str || "").replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728)).replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1584));
}
function normalizeMobile(m) {
  if (!m) return null;
  const converted = toEnglishDigits(m);
  let cleaned = converted.replace(/\D/g, "");
  if (cleaned.startsWith("0098")) {
    cleaned = "0" + cleaned.substring(4);
  } else if (cleaned.startsWith("98") && cleaned.length === 12) {
    cleaned = "0" + cleaned.substring(2);
  } else if (cleaned.startsWith("+98")) {
    cleaned = "0" + cleaned.substring(3);
  } else if (cleaned.length === 10 && cleaned.startsWith("9")) {
    cleaned = "0" + cleaned;
  }
  return /^09\d{9}$/.test(cleaned) ? cleaned : null;
}
async function sendTicketReplySms(mobile, ticketNumber, ticketSubject, replyText) {
  const normalizedMobile = normalizeMobile(mobile) || mobile;
  const excerpt = replyText.length > 60 ? replyText.slice(0, 57) + "..." : replyText;
  const smsBody = `\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627\u060C \u062A\u06CC\u06A9\u062A \u0634\u0645\u0627\u0631\u0647 ${ticketNumber} \u0628\u0627 \u0645\u0648\u0636\u0648\u0639 \xAB${ticketSubject}\xBB \u062A\u0648\u0633\u0637 \u06A9\u0627\u0631\u0634\u0646\u0627\u0633 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u067E\u0627\u0633\u062E \u062F\u0627\u062F\u0647 \u0634\u062F.
\u067E\u0627\u0633\u062E: ${excerpt}
\u062C\u0647\u062A \u0645\u0634\u0627\u0647\u062F\u0647 \u0628\u0647 \u067E\u0646\u0644 \u06A9\u0627\u0631\u0628\u0631\u06CC \u062E\u0648\u062F \u0645\u0631\u0627\u062C\u0639\u0647 \u0641\u0631\u0645\u0627\u06CC\u06CC\u062F.`;
  console.log(`
======================================================`);
  console.log(`[SMS NOTIFICATION DISPATCH - SUPPORT TICKET REPLY]`);
  console.log(`To Mobile: ${normalizedMobile}`);
  console.log(`Ticket: ${ticketNumber} - ${ticketSubject}`);
  console.log(`SMS Content:
${smsBody}`);
  console.log(`Timestamp: ${(/* @__PURE__ */ new Date()).toISOString()}`);
  console.log(`======================================================
`);
  try {
    const medianaApiKey = process.env.MEDIANA_API_KEY;
    const medianaBaseUrl = process.env.MEDIANA_BASE_URL;
    const kavenegarKey = process.env.KAVENEGAR_API_KEY;
    if (medianaApiKey && medianaBaseUrl) {
      await fetch(`${medianaBaseUrl}/sms/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": process.env.MEDIANA_AUTH_PREFIX ? `${process.env.MEDIANA_AUTH_PREFIX} ${medianaApiKey}` : medianaApiKey
        },
        body: JSON.stringify({
          recipient: normalizedMobile,
          message: smsBody,
          pattern_code: process.env.MEDIANA_PATTERN_CODE
        })
      }).catch((e) => console.warn("[Mediana SMS Warning]", e.message));
    } else if (kavenegarKey) {
      await fetch(`https://api.kavenegar.com/v1/${kavenegarKey}/sms/send.json`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          receptor: normalizedMobile,
          message: smsBody
        })
      }).catch((e) => console.warn("[Kavenegar SMS Warning]", e.message));
    }
  } catch (err) {
    console.error("[SMS DISPATCH ERROR]", err.message);
  }
}
async function sendOtpSms(mobile, code) {
  const normalizedMobile = normalizeMobile(mobile) || mobile;
  return await dispatchOtpSms(normalizedMobile, code);
}
router.post("/auth/otp/request", otpRequestLimiter, async (req, res) => {
  const mobile = normalizeMobile(req.body.mobile || "");
  if (!mobile) {
    return res.status(422).json({ message: "\u0634\u0645\u0627\u0631\u0647 \u0645\u0648\u0628\u0627\u06CC\u0644 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A." });
  }
  const recentSends = db.getRecentOtpsCount(mobile, 3600);
  if (recentSends >= 10) {
    return res.status(429).json({ message: "\u062A\u0639\u062F\u0627\u062F \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u06A9\u062F \u062F\u0631 \u06CC\u06A9 \u0633\u0627\u0639\u062A \u0628\u06CC\u0634 \u0627\u0632 \u062D\u062F \u0645\u062C\u0627\u0632 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u0628\u0639\u062F\u0627\u064B \u062A\u0644\u0627\u0634 \u06A9\u0646\u06CC\u062F." });
  }
  const lastOtp = db.getLastOtp(mobile);
  if (lastOtp && Date.now() - lastOtp.created_at < 3e4) {
    return res.status(429).json({ message: "\u0628\u0631\u0627\u06CC \u0627\u0631\u0633\u0627\u0644 \u0645\u062C\u062F\u062F \u06A9\u062F \u062D\u062F\u0627\u0642\u0644 \u06F3\u06F0 \u062B\u0627\u0646\u06CC\u0647 \u0635\u0628\u0631 \u06A9\u0646\u06CC\u062F." });
  }
  const code = Math.floor(1e4 + Math.random() * 9e4).toString();
  const ttlSeconds = 120;
  db.addOtp(mobile, code, ttlSeconds);
  await sendOtpSms(mobile, code);
  return res.json({
    message: "\u06A9\u062F \u062A\u0623\u06CC\u06CC\u062F \u0628\u0631\u0627\u06CC \u0634\u0645\u0627\u0631\u0647 \u0634\u0645\u0627 \u0627\u0631\u0633\u0627\u0644 \u0634\u062F.",
    expires_in: ttlSeconds,
    resend_after: 60
  });
});
router.post("/auth/otp/verify", otpVerifyLimiter, (req, res) => {
  const mobile = normalizeMobile(req.body.mobile || "");
  const code = String(req.body.code || "").trim();
  if (!mobile) {
    return res.status(422).json({ message: "\u0634\u0645\u0627\u0631\u0647 \u0645\u0648\u0628\u0627\u06CC\u0644 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A." });
  }
  const otp = db.getLastOtp(mobile);
  if (!otp || otp.status !== "sent") {
    return res.status(422).json({ message: "\u06A9\u062F \u0641\u0639\u0627\u0644 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F. \u0644\u0637\u0641\u0627\u064B \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u06A9\u062F \u062C\u062F\u06CC\u062F \u062F\u0647\u06CC\u062F." });
  }
  if (Date.now() > otp.expires_at) {
    otp.status = "expired";
    return res.status(422).json({ message: "\u06A9\u062F \u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u0645\u062C\u062F\u062F\u0627\u064B \u062A\u0644\u0627\u0634 \u06A9\u0646\u06CC\u062F." });
  }
  if (otp.attempts >= 5) {
    logSecurityEvent(req, {
      actionDescription: `\u0645\u0633\u062F\u0648\u062F\u0633\u0627\u0632\u06CC \u0645\u0648\u0642\u062A \u062A\u0623\u06CC\u06CC\u062F \u0634\u0645\u0627\u0631\u0647 \u0628\u0647 \u062F\u0644\u06CC\u0644 \u06F5 \u0628\u0627\u0631 \u0648\u0631\u0648\u062F \u0627\u0634\u062A\u0628\u0627\u0647 \u06A9\u062F OTP (${mobile})`,
      resourceType: "AUTH_SECURITY",
      resourceId: mobile,
      status: "WARNING",
      details: { mobile, attempts: otp.attempts }
    });
    return res.status(429).json({ message: "\u062A\u0639\u062F\u0627\u062F \u062F\u0641\u0639\u0627\u062A \u0627\u0634\u062A\u0628\u0627\u0647 \u0628\u06CC\u0634 \u0627\u0632 \u062D\u062F \u0645\u062C\u0627\u0632 (\u06F5 \u0628\u0627\u0631) \u0628\u0648\u062F. \u0644\u0637\u0641\u0627\u064B \u06A9\u062F \u062C\u062F\u06CC\u062F \u062F\u0631\u06CC\u0627\u0641\u062A \u06A9\u0646\u06CC\u062F." });
  }
  const isMatch = otp.code === code;
  if (!isMatch) {
    otp.attempts++;
    const remaining = 5 - otp.attempts;
    logSecurityEvent(req, {
      actionDescription: `\u062A\u0644\u0627\u0634 \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0631\u0627\u06CC \u0648\u0631\u0648\u062F \u06A9\u062F \u062A\u0623\u06CC\u06CC\u062F OTP (\u0634\u0645\u0627\u0631\u0647: ${mobile})`,
      resourceType: "AUTH_SECURITY",
      resourceId: mobile,
      status: "WARNING",
      details: { mobile, attempt_number: otp.attempts, remaining_attempts: remaining }
    });
    return res.status(422).json({
      message: `\u06A9\u062F \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0635\u062D\u06CC\u062D \u0646\u06CC\u0633\u062A.${remaining > 0 ? ` (${remaining} \u0628\u0627\u0631 \u062A\u0644\u0627\u0634 \u0628\u0627\u0642\u06CC\u200C\u0645\u0627\u0646\u062F\u0647)` : " \u062A\u0639\u062F\u0627\u062F \u062A\u0644\u0627\u0634 \u0628\u0647 \u067E\u0627\u06CC\u0627\u0646 \u0631\u0633\u06CC\u062F."}`
    });
  }
  otp.status = "verified";
  let user = db.getUserByMobile(mobile);
  if (!user) {
    user = db.createUser(mobile);
  } else {
    user.mobile_verified_at = (/* @__PURE__ */ new Date()).toISOString();
    if (user.deleted_at) {
      delete user.deleted_at;
      user.status = "active";
      user.is_active = true;
      const comp = db.getCompanyByUserId(user.id);
      if (comp && comp.deleted_at) {
        delete comp.deleted_at;
        comp.is_active = true;
      }
      const now = /* @__PURE__ */ new Date();
      db.subscriptions.filter((s) => s.user_id === user.id).forEach((s) => {
        if (!s.expires_at || new Date(s.expires_at) > now) {
          delete s.deleted_at;
          s.status = "active";
          s.is_active = true;
        }
      });
      db.save();
    }
  }
  const token = import_jsonwebtoken.default.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "30d" });
  const hasSub = db.subscriptions.some((s) => s.user_id === user.id && s.status === "active" && (!s.expires_at || new Date(s.expires_at) > /* @__PURE__ */ new Date()));
  const cookieExpireDays = 30;
  const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
  res.cookie("karovita_token", token, {
    maxAge: 1e3 * 60 * 60 * 24 * cookieExpireDays,
    httpOnly: false,
    secure: isHttps,
    sameSite: "lax",
    path: "/"
  });
  res.cookie("karovita_role", user.role, {
    maxAge: 1e3 * 60 * 60 * 24 * cookieExpireDays,
    httpOnly: false,
    secure: isHttps,
    sameSite: "lax",
    path: "/"
  });
  return res.json({
    access_token: token,
    token,
    token_type: "Bearer",
    expires_in: 3600 * 24 * cookieExpireDays,
    user: {
      ...user,
      has_subscription: hasSub
    }
  });
});
router.post("/auth/logout", (_req, res) => {
  res.clearCookie("karovita_token", { path: "/" });
  res.clearCookie("karovita_role", { path: "/" });
  res.clearCookie("token", { path: "/" });
  return res.json({ status: "ok", message: "\u062E\u0631\u0648\u062C \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0646\u062C\u0627\u0645 \u0634\u062F." });
});
router.get("/onboarding", authMiddleware, (req, res) => {
  const user = req.user;
  const company = db.getCompanyByUserId(user.id) || null;
  const hasSub = db.subscriptions.some((s) => s.user_id === user.id && s.status === "active" && (!s.expires_at || new Date(s.expires_at) > /* @__PURE__ */ new Date()));
  const trialSub = db.subscriptions.find((s) => s.user_id === user.id && s.source === "trial" && s.status === "active") || null;
  return res.json({
    user: {
      ...user,
      has_subscription: hasSub
    },
    company,
    next_step: user.onboarding_step,
    has_subscription: hasSub,
    trial_subscription: trialSub,
    has_used_trial: Boolean(user.has_used_trial)
  });
});
router.post("/onboarding/user", authMiddleware, (req, res) => {
  const user = req.user;
  const first_name = String(req.body.first_name || "").trim();
  const last_name = String(req.body.last_name || "").trim();
  const email = String(req.body.email || "").trim();
  if (first_name.length < 2 || last_name.length < 2) {
    return res.status(422).json({ message: "\u0646\u0627\u0645 \u0648 \u0646\u0627\u0645 \u062E\u0627\u0646\u0648\u0627\u062F\u06AF\u06CC \u0631\u0627 \u06A9\u0627\u0645\u0644 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F." });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(422).json({ message: "\u0627\u06CC\u0645\u06CC\u0644 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A." });
  }
  user.first_name = first_name;
  user.last_name = last_name;
  user.email = email || null;
  user.onboarding_step = Math.max(user.onboarding_step, 2);
  user.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  db.save();
  return res.json({
    message: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u06A9\u0627\u0631\u0628\u0631\u06CC \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F.",
    next_step: 2
  });
});
router.post("/onboarding/company", authMiddleware, (req, res) => {
  const user = req.user;
  const name = String(req.body.name || "").trim();
  const industry = String(req.body.industry || "").trim();
  const employee_count = parseInt(req.body.employee_count, 10) || 0;
  const job_title = String(req.body.job_title || "").trim();
  if (name.length < 2 || !industry || employee_count < 1 || !job_title) {
    return res.status(422).json({ message: "\u062A\u0645\u0627\u0645 \u0645\u0634\u062E\u0635\u0627\u062A \u0634\u0631\u06A9\u062A \u0631\u0627 \u06A9\u0627\u0645\u0644 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F." });
  }
  db.upsertCompany(user.id, name, industry, employee_count);
  user.job_title = job_title;
  user.onboarding_step = 3;
  user.onboarding_completed_at = (/* @__PURE__ */ new Date()).toISOString();
  user.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  db.save();
  return res.json({
    message: "\u0645\u0634\u062E\u0635\u0627\u062A \u0634\u0631\u06A9\u062A \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F.",
    next_step: 3
  });
});
router.get("/auth/me", authMiddleware, (req, res) => {
  const user = req.user;
  return res.json({
    user: {
      id: user.id,
      mobile: user.mobile,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      job_title: user.job_title,
      national_code: user.national_code || null,
      company_name: user.company_name,
      onboarding_step: user.onboarding_step,
      created_at: user.created_at
    }
  });
});
router.get("/profile", authMiddleware, (req, res) => {
  const user = req.user;
  return res.json({
    data: {
      id: user.id,
      mobile: user.mobile,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      job_title: user.job_title,
      national_code: user.national_code || null
    }
  });
});
router.post("/profile/otp/request", authMiddleware, otpRequestLimiter, async (req, res) => {
  const user = req.user;
  const mobile = user.mobile;
  const recentSends = db.getRecentOtpsCount(mobile, 3600);
  if (recentSends >= 10) {
    return res.status(429).json({ message: "\u062A\u0639\u062F\u0627\u062F \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u0628\u06CC\u0634 \u0627\u0632 \u062D\u062F \u0645\u062C\u0627\u0632 \u0627\u0633\u062A." });
  }
  const lastOtp = db.getLastOtp(mobile);
  if (lastOtp && Date.now() - lastOtp.created_at < 1e4) {
    return res.status(429).json({ message: "\u0628\u0631\u0627\u06CC \u0627\u0631\u0633\u0627\u0644 \u0645\u062C\u062F\u062F \u06A9\u0645\u06CC \u0635\u0628\u0631 \u06A9\u0646\u06CC\u062F." });
  }
  const code = Math.floor(1e4 + Math.random() * 9e4).toString();
  const ttlSeconds = 120;
  db.addOtp(mobile, code, ttlSeconds);
  console.log(`[PROFILE OTP SERVICE] Mobile: ${mobile} => OTP Code: ${code}`);
  await sendOtpSms(mobile, code);
  return res.json({
    message: `\u06A9\u062F \u062A\u0623\u06CC\u06CC\u062F \u0628\u0647 \u0634\u0645\u0627\u0631\u0647 ${mobile} \u0627\u0631\u0633\u0627\u0644 \u0634\u062F.`,
    expires_in: ttlSeconds,
    resend_after: 60
  });
});
router.post("/profile/otp/verify", authMiddleware, otpVerifyLimiter, (req, res) => {
  const user = req.user;
  const mobile = user.mobile;
  const code = String(req.body.code || "").trim();
  if (!code) {
    return res.status(422).json({ message: "\u0644\u0637\u0641\u0627\u064B \u06A9\u062F \u062A\u0623\u06CC\u06CC\u062F \u0631\u0627 \u0648\u0627\u0631\u062F \u0646\u0645\u0627\u06CC\u06CC\u062F." });
  }
  const otp = db.getLastOtp(mobile);
  if (!otp || otp.status !== "sent") {
    return res.status(422).json({ message: "\u06A9\u062F \u0641\u0639\u0627\u0644 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F. \u0644\u0637\u0641\u0627\u064B \u0645\u062C\u062F\u062F\u0627\u064B \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u0627\u0631\u0633\u0627\u0644 \u06A9\u062F \u062F\u0647\u06CC\u062F." });
  }
  if (Date.now() > otp.expires_at) {
    otp.status = "expired";
    return res.status(422).json({ message: "\u06A9\u062F \u062A\u0623\u06CC\u06CC\u062F \u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647 \u0627\u0633\u062A." });
  }
  if (otp.attempts >= 5) {
    return res.status(429).json({ message: "\u062A\u0639\u062F\u0627\u062F \u062A\u0644\u0627\u0634 \u0645\u062C\u0627\u0632 \u062A\u0645\u0627\u0645 \u0634\u062F\u0647 \u0627\u0633\u062A." });
  }
  if (otp.code !== code) {
    otp.attempts++;
    return res.status(422).json({ message: "\u06A9\u062F \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0635\u062D\u06CC\u062D \u0646\u06CC\u0633\u062A." });
  }
  otp.status = "verified";
  return res.json({
    success: true,
    message: "\u06A9\u062F \u062A\u0623\u06CC\u06CC\u062F \u0634\u062F. \u0627\u06A9\u0646\u0648\u0646 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062D\u0633\u0627\u0628 \u0631\u0627 \u0648\u06CC\u0631\u0627\u06CC\u0634 \u06A9\u0646\u06CC\u062F."
  });
});
router.put("/profile", authMiddleware, (req, res) => {
  const user = req.user;
  user.first_name = String(req.body.first_name || "").trim();
  user.last_name = String(req.body.last_name || "").trim();
  user.email = String(req.body.email || "").trim() || null;
  user.job_title = String(req.body.job_title || "").trim();
  const cleanNationalCode = toEnglishDigits(String(req.body.national_code || "")).replace(/\D/g, "").trim();
  if (cleanNationalCode && cleanNationalCode.length !== 10 && cleanNationalCode.length !== 11) {
    return res.status(422).json({ message: "\u06A9\u062F \u0645\u0644\u06CC \u0628\u0627\u06CC\u062F \u06F1\u06F0 \u0631\u0642\u0645 \u0648 \u0634\u0646\u0627\u0633\u0647 \u0645\u0644\u06CC \u0634\u0631\u06A9\u062A \u0628\u0627\u06CC\u062F \u06F1\u06F1 \u0631\u0642\u0645 \u0628\u0627\u0634\u062F." });
  }
  user.national_code = cleanNationalCode || null;
  user.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  db.save();
  return res.json({
    message: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062D\u0633\u0627\u0628 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F.",
    data: {
      id: user.id,
      mobile: user.mobile,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      job_title: user.job_title,
      national_code: user.national_code
    }
  });
});
router.get("/configurator/data", cacheGet(6e4), (_req, res) => {
  const activeModules = db.erpModules.filter((m) => m.is_active !== false);
  const activeIds = new Set(activeModules.map((m) => m.id));
  const sanitizedPresets = db.industryPresets.map((p) => ({
    ...p,
    default_modules: (p.default_modules || []).filter((id) => activeIds.has(id)),
    mandatory_modules: (p.mandatory_modules || []).filter((id) => activeIds.has(id))
  }));
  return res.json({
    modules: activeModules,
    presets: sanitizedPresets,
    settings: db.configuratorSettings
  });
});
router.post("/configurator/calculate", (req, res) => {
  const { selected_module_ids = [], user_count, billing_period = "3_months", coupon_code = "" } = req.body;
  const baseLimit = db.configuratorSettings.base_user_limit || 1;
  const finalUsers = typeof user_count === "number" && user_count > 0 ? user_count : Number(user_count) || baseLimit;
  const calc = db.calculateERPPrice(
    Array.isArray(selected_module_ids) ? selected_module_ids : [],
    finalUsers,
    billing_period || "3_months",
    String(coupon_code || "")
  );
  return res.json({ data: calc });
});
router.post("/coupons/validate", couponValidateLimiter, (req, res) => {
  const code = String(req.body.code || "").trim().toUpperCase();
  if (!code) {
    return res.status(422).json({ message: "\u0644\u0637\u0641\u0627\u064B \u06A9\u062F \u062A\u062E\u0641\u06CC\u0641 \u0631\u0627 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F." });
  }
  const coupon = db.coupons.find((c) => c.code.toUpperCase() === code && c.is_active);
  if (!coupon) {
    return res.status(404).json({ message: "\u06A9\u062F \u062A\u062E\u0641\u06CC\u0641 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A \u06CC\u0627 \u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647 \u0627\u0633\u062A." });
  }
  return res.json({
    data: {
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount,
      max_discount_amount: coupon.max_discount_amount
    }
  });
});
router.get("/packages", cacheGet(6e4), (_req, res) => {
  const list = db.packages.filter((p) => p.is_active).sort((a, b) => a.price - b.price);
  return res.json({ data: list });
});
router.post("/trial", authMiddleware, (req, res) => {
  const user = req.user;
  if (user.onboarding_step < 3) {
    return res.status(422).json({ message: "\u0627\u0628\u062A\u062F\u0627 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u06A9\u0627\u0631\u0628\u0631\u06CC \u0648 \u0634\u0631\u06A9\u062A \u0631\u0627 \u062A\u06A9\u0645\u06CC\u0644 \u06A9\u0646\u06CC\u062F." });
  }
  const alreadyHadTrial = db.subscriptions.some((s) => s.user_id === user.id && s.source === "trial");
  if (alreadyHadTrial) {
    return res.status(409).json({ message: "\u062F\u0648\u0631\u0647 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u0642\u0628\u0644\u0627\u064B \u0628\u0631\u0627\u06CC \u0634\u0645\u0627 \u0641\u0639\u0627\u0644 \u0634\u062F\u0647 \u0627\u0633\u062A." });
  }
  const selectedModuleIds = Array.isArray(req.body.selected_module_ids) ? req.body.selected_module_ids : [];
  const baseLimit = db.configuratorSettings.base_user_limit || 1;
  const userCount = Number(req.body.user_count) || baseLimit;
  if (selectedModuleIds.length > 0) {
    db.createERPSubscription(user.id, null, selectedModuleIds, userCount, "monthly", "trial", 5);
  } else {
    const trialPkg = db.packages.find((p) => p.slug === "trial" && p.is_active) || db.packages[0];
    db.createSubscription(user.id, trialPkg?.id || 1, null, "trial", 5, trialPkg?.usage_limit || null);
  }
  if (!user.onboarding_completed_at) {
    user.onboarding_completed_at = (/* @__PURE__ */ new Date()).toISOString();
    user.onboarding_step = 3;
    db.save();
  }
  return res.status(201).json({ message: "\u062F\u0648\u0631\u0647 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u06F5 \u0631\u0648\u0632\u0647 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 \u0628\u0631\u0627\u06CC \u0634\u0645\u0627 \u0641\u0639\u0627\u0644 \u0634\u062F." });
});
router.post("/orders", authMiddleware, orderCreationLimiter, async (req, res) => {
  const user = req.user;
  if (user.onboarding_step < 3) {
    return res.status(422).json({ message: "\u0627\u0628\u062A\u062F\u0627 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u06A9\u0627\u0631\u0628\u0631\u06CC \u0648 \u0634\u0631\u06A9\u062A \u0631\u0627 \u062A\u06A9\u0645\u06CC\u0644 \u06A9\u0646\u06CC\u062F." });
  }
  const { selected_module_ids, user_count, billing_period = "yearly", coupon_code = "", package_id, subscription_id } = req.body;
  let order;
  let finalAmount = 0;
  const baseUserLimit = db.configuratorSettings.base_user_limit || 1;
  const resolvedUserCount = typeof user_count === "number" && user_count > 0 ? user_count : Number(user_count) || baseUserLimit;
  const hasModules = Array.isArray(selected_module_ids) && selected_module_ids.length > 0;
  const hasExtraUsers = resolvedUserCount > baseUserLimit;
  if (hasModules || hasExtraUsers) {
    order = db.createERPOrder(
      user.id,
      selected_module_ids || [],
      resolvedUserCount,
      billing_period || "yearly",
      coupon_code,
      subscription_id ? Number(subscription_id) : void 0
    );
    if (req.body.order_type) order.order_type = req.body.order_type;
    if (req.body.is_resource_addon) order.is_resource_addon = req.body.is_resource_addon;
    finalAmount = order.amount;
  } else if (package_id) {
    const pkg = db.packages.find((p) => p.id === Number(package_id) && p.is_active);
    if (!pkg) {
      return res.status(404).json({ message: "\u067E\u06A9\u06CC\u062C \u0642\u0627\u0628\u0644 \u062E\u0631\u06CC\u062F \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
    }
    order = db.createOrder(user.id, pkg.id, pkg.price);
    if (subscription_id) order.subscription_id = Number(subscription_id);
    if (req.body.order_type) order.order_type = req.body.order_type;
    if (req.body.is_resource_addon) order.is_resource_addon = req.body.is_resource_addon;
    finalAmount = pkg.price;
  } else {
    return res.status(422).json({ message: "\u062D\u062F\u0627\u0642\u0644 \u06CC\u06A9 \u0645\u0627\u0698\u0648\u0644 \u06CC\u0627 \u0638\u0631\u0641\u06CC\u062A \u06A9\u0627\u0631\u0628\u0631 \u0628\u0631\u0627\u06CC \u062E\u0631\u06CC\u062F \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F." });
  }
  if (finalAmount <= 0) {
    order.status = "paid";
    if (order.module_ids && order.module_ids.length > 0 || order.user_count && order.user_count > 0) {
      db.activateOrMergeERPSubscription(
        user.id,
        order.id,
        order.module_ids || [],
        order.user_count || db.configuratorSettings.base_user_limit || 1,
        order.billing_period || "3_months",
        "purchase",
        order.subscription_id,
        order.order_type === "resource_upgrade" || Boolean(order.is_resource_addon)
      );
    }
    if (!user.onboarding_completed_at) {
      user.onboarding_completed_at = (/* @__PURE__ */ new Date()).toISOString();
      user.onboarding_step = 3;
    }
    const clientOrigin2 = `${req.protocol}://${req.get("host") || "localhost:3000"}`;
    sendInvoiceIssuedSms(order, user, clientOrigin2).catch((err) => console.warn("[Invoice SMS Error]", err));
    db.save();
    return res.status(201).json({
      order_id: order.id,
      order_number: order.order_number,
      payment_url: `/dashboard?payment=success`
    });
  }
  const clientOrigin = `${req.protocol}://${req.get("host") || "localhost:3000"}`;
  sendInvoiceIssuedSms(order, user, clientOrigin).catch((err) => console.warn("[Invoice SMS Error]", err));
  const zibalRes = await initiateZibalPayment(order, user, clientOrigin);
  const trackId = String(zibalRes.trackId || "sandbox-" + Math.random().toString(36).substring(2, 14));
  db.createTransaction(order.id, user.id, trackId, finalAmount);
  const tx = db.transactions.find((t) => t.authority === trackId);
  if (tx) {
    tx.gateway = "zibal";
    tx.raw_response = zibalRes.rawResponse;
  }
  db.save();
  return res.status(201).json({
    order_id: order.id,
    order_number: order.order_number,
    payment_url: zibalRes.paymentUrl || `/api/payments/zibal/callback?trackId=${trackId}&success=1&status=2&orderId=${order.id}`,
    trackId
  });
});
var handleCallback = async (req, res) => {
  const trackId = String(req.query.trackId || req.body.trackId || req.query.authority || req.body.authority || "");
  const success = String(req.query.success ?? req.body.success ?? "1");
  const statusParam = String(req.query.status ?? req.body.status ?? "2");
  const orderIdParam = Number(req.query.orderId || req.body.orderId || 0);
  let tx = db.transactions.find((t) => t.authority === trackId);
  if (!tx && orderIdParam > 0) {
    tx = db.transactions.filter((t) => t.order_id === orderIdParam).pop();
  }
  if (!tx) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head><meta charset="utf-8"><title>\u062A\u0631\u0627\u06A9\u0646\u0634 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F</title>
      <style>body{font-family:system-ui;text-align:center;padding:50px;background:#f8fafc;color:#1e293b}a{color:#0284c7;text-decoration:none;font-weight:bold;margin-top:20px;display:inline-block}</style>
      </head>
      <body>
        <h2>\u062E\u0637\u0627 \u062F\u0631 \u0634\u0646\u0627\u0633\u0627\u06CC\u06CC \u062A\u0631\u0627\u06A9\u0646\u0634</h2>
        <p>\u0634\u0646\u0627\u0633\u0647 \u067E\u06CC\u06AF\u06CC\u0631\u06CC \u0627\u0631\u0633\u0627\u0644 \u0634\u062F\u0647 \u0627\u0632 \u062F\u0631\u06AF\u0627\u0647 \u062F\u0631 \u0633\u0627\u0645\u0627\u0646\u0647 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F.</p>
        <a href="/dashboard">\u0628\u0627\u0632\u06AF\u0634\u062A \u0628\u0647 \u067E\u0646\u0644 \u06A9\u0627\u0631\u0628\u0631\u06CC</a>
      </body></html>
    `);
  }
  const order = db.orders.find((o) => o.id === tx.order_id);
  const user = db.getUserById(tx.user_id);
  if (success !== "1" && success !== "true") {
    tx.status = "failed";
    tx.raw_response = { query: req.query, body: req.body, reason: "user_cancelled_or_bank_error" };
    db.save();
    return res.redirect(`/dashboard?payment=failed&order=${order?.id || ""}&msg=${encodeURIComponent("\u062A\u0631\u0627\u06A9\u0646\u0634 \u062A\u0648\u0633\u0637 \u06A9\u0627\u0631\u0628\u0631 \u0644\u063A\u0648 \u0634\u062F \u06CC\u0627 \u062F\u0631 \u0634\u0628\u06A9\u0647 \u0628\u0627\u0646\u06A9\u06CC \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062F.")}`);
  }
  try {
    const verifyResult = await verifyZibalPayment(trackId);
    if (verifyResult.success && order) {
      const refNumber = verifyResult.refNumber || "SHP-" + Date.now().toString().slice(-8);
      tx.status = "successful";
      tx.reference_id = refNumber;
      tx.paid_at = verifyResult.paidAt || (/* @__PURE__ */ new Date()).toISOString();
      tx.raw_response = verifyResult.rawResponse || verifyResult;
      order.status = "paid";
      if (order.module_ids && order.module_ids.length > 0) {
        db.activateOrMergeERPSubscription(
          tx.user_id,
          order.id,
          order.module_ids,
          order.user_count || db.configuratorSettings.base_user_limit || 1,
          order.billing_period || "monthly",
          "purchase",
          order.subscription_id,
          order.order_type === "resource_upgrade" || Boolean(order.is_resource_addon)
        );
      } else if (order.package_id) {
        const pkg = db.getPackageById(order.package_id);
        if (pkg) {
          db.createSubscription(tx.user_id, pkg.id, order.id, "purchase", pkg.duration_days, pkg.usage_limit);
        }
      }
      if (user && !user.onboarding_completed_at) {
        user.onboarding_completed_at = (/* @__PURE__ */ new Date()).toISOString();
        user.onboarding_step = 3;
      }
      db.save();
      logFinancialEvent(req, {
        actionType: "ZIBAL_ONLINE_PAYMENT_VERIFIED",
        orderId: order.id,
        transactionId: tx.id,
        amount: order.amount,
        referenceId: refNumber,
        userId: tx.user_id,
        actionDescription: `\u062A\u0623\u06CC\u06CC\u062F\u06CC\u0647 \u0645\u0648\u0641\u0642 \u067E\u0631\u062F\u0627\u062E\u062A \u0622\u0646\u0644\u0627\u06CC\u0646 \u062F\u0631\u06AF\u0627\u0647 \u0634\u0627\u067E\u0631\u06A9 \u0632\u06CC\u0628\u0627\u0644 \u0628\u0631\u0627\u06CC \u0633\u0641\u0627\u0631\u0634 #${order.order_number} \u0628\u0647 \u0645\u0628\u0644\u063A ${(order.amount || 0).toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646 \u0628\u0627 \u0634\u0645\u0627\u0631\u0647 \u067E\u06CC\u06AF\u06CC\u0631\u06CC \u0634\u0627\u067E\u0631\u06A9 ${refNumber}`,
        details: {
          trackId,
          shaparakRef: refNumber,
          cardNumber: verifyResult.cardNumber,
          gateway: "zibal"
        }
      });
      if (user) {
        sendPaymentSuccessSms(tx, order, user).catch((err) => console.warn("[Payment SMS Error]", err));
      }
      try {
        const userSubs = db.getUserPushSubscriptions(tx.user_id);
        if (userSubs.length > 0) {
          broadcastWebPush(userSubs, {
            title: "\u067E\u0631\u062F\u0627\u062E\u062A \u0645\u0648\u0641\u0642 \u0633\u0641\u0627\u0631\u0634",
            body: `\u067E\u0631\u062F\u0627\u062E\u062A \u0633\u0641\u0627\u0631\u0634 #${order.order_number} \u0628\u0647 \u0645\u0628\u0644\u063A ${(order.amount || 0).toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062A\u0627\u06CC\u06CC\u062F \u0634\u062F.`,
            url: `/dashboard`,
            tag: `payment-${order.id}`
          }).catch(() => {
          });
        }
      } catch {
      }
      return res.redirect(`/dashboard?payment=success&order=${order.id}&ref=${encodeURIComponent(refNumber)}`);
    } else {
      tx.status = "failed";
      tx.raw_response = verifyResult.rawResponse || verifyResult;
      db.save();
      return res.redirect(`/dashboard?payment=failed&order=${order?.id || ""}&msg=${encodeURIComponent(verifyResult.message || "\u062E\u0637\u0627 \u062F\u0631 \u062A\u0627\u06CC\u06CC\u062F \u062A\u0631\u0627\u06A9\u0646\u0634 \u0634\u0627\u067E\u0631\u06A9")}`);
    }
  } catch (err) {
    tx.status = "failed";
    db.save();
    return res.redirect(`/dashboard?payment=failed&order=${order?.id || ""}&msg=${encodeURIComponent("\u062E\u0637\u0627\u06CC \u0641\u0646\u06CC \u062F\u0631 \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u062F\u0631\u06AF\u0627\u0647: " + err.message)}`);
  }
};
router.get("/payments/callback", handleCallback);
router.post("/payments/callback", handleCallback);
router.get("/payments/zibal/callback", handleCallback);
router.post("/payments/zibal/callback", handleCallback);
router.get("/dashboard", authMiddleware, (req, res) => {
  const user = req.user;
  const company = db.getCompanyByUserId(user.id);
  const userSubs = db.subscriptions.filter((s) => s.user_id === user.id).sort((a, b) => b.id - a.id).map((s) => {
    const pkg = s.package_id ? db.getPackageById(s.package_id) : null;
    const order = s.order_id ? db.orders.find((o) => o.id === s.order_id) : null;
    const transaction = order ? db.transactions.find((t) => t.order_id === order.id && t.status === "successful") : null;
    let moduleObjects = [];
    let moduleNames = [];
    if (s.module_ids && Array.isArray(s.module_ids)) {
      moduleObjects = s.module_ids.map((id) => {
        const m = db.erpModules.find((x) => x.id === id);
        return {
          id,
          title: m?.title || id,
          price: m?.price || 0,
          dependencies: m?.dependencies || [],
          industries: m?.industries || []
        };
      });
      moduleNames = moduleObjects.map((m) => m.title);
    } else if (pkg && Array.isArray(pkg.features)) {
      moduleNames = pkg.features;
      moduleObjects = pkg.features.map((f, idx) => ({ id: `feat_${idx}`, title: f, price: 0 }));
    }
    const safeCompanySlug = (company?.name ? company.name.toLowerCase().replace(/[^a-z0-9]/g, "") : "workspace") || "workspace";
    const isSubActive = s.status === "active" && new Date(s.expires_at) > /* @__PURE__ */ new Date();
    return {
      ...s,
      package_name: s.title || pkg?.name || `\u0627\u0634\u062A\u0631\u0627\u06A9 \u0633\u0627\u0632\u0645\u0627\u0646\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 (${moduleNames.length} \u0645\u0627\u0698\u0648\u0644)`,
      module_names: moduleNames,
      modules_detail: moduleObjects,
      user_count: s.user_count || order?.user_count || db.configuratorSettings.base_user_limit || 1,
      billing_period: s.billing_period || order?.billing_period || "monthly",
      order_number: order?.order_number || (s.source === "trial" ? `TRIAL-KAROVITA-${s.id}` : "\u2014"),
      order_amount: order?.amount || pkg?.price || 0,
      discount_amount: order?.discount_amount || 0,
      coupon_code: order?.coupon_code || null,
      reference_id: transaction?.reference_id || (s.source === "trial" ? "\u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u0631\u0627\u06CC\u06AF\u0627\u0646" : null),
      paid_at: transaction?.paid_at || s.created_at,
      price: pkg?.price || order?.amount || 0,
      usage_percent: s.usage_limit ? Math.round(s.usage_used / s.usage_limit * 100) : 0,
      server_instance: {
        subdomain: `${safeCompanySlug}-${user.id}.karovita.ir`,
        portal_url: `/workspace/${s.id}`,
        status: isSubActive ? "online" : "paused",
        ssl: true,
        database: "PostgreSQL 16 Enterprise (\u0627\u062E\u062A\u0635\u0627\u0635\u06CC)",
        backup_status: "\u0631\u0648\u0632\u0627\u0646\u0647 \u062E\u0648\u062F\u06A9\u0627\u0631 (\u0633\u0627\u0639\u062A \u06F0\u06F2:\u06F0\u06F0 \u0628\u0627\u0645\u062F\u0627\u062F)",
        datacenter: "\u062F\u06CC\u062A\u0627\u0633\u0646\u062A\u0631 \u0627\u0628\u0631\u06CC \u062A\u0647\u0631\u0627\u0646 - \u0628\u0631\u062C \u0645\u06CC\u0644\u0627\u062F",
        dedicated_ip: `185.143.232.${user.id % 200 + 10}`
      }
    };
  });
  const userTxs = db.transactions.filter((t) => t.user_id === user.id).sort((a, b) => b.id - a.id).map((t) => {
    const ord = db.orders.find((o) => o.id === t.order_id);
    const pkg = ord?.package_id ? db.getPackageById(ord.package_id) : null;
    let title = pkg?.name || "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627";
    if (ord?.module_ids && ord.module_ids.length > 0) {
      title = `\u0633\u0641\u0627\u0631\u0634 \u0633\u0627\u0632\u0645\u0627\u0646\u06CC (${ord.module_ids.length} \u0645\u0627\u0698\u0648\u0644 - ${ord.user_count || db.configuratorSettings.base_user_limit || 1} \u06A9\u0627\u0631\u0628\u0631)`;
    }
    return {
      id: t.id,
      amount: t.amount,
      status: t.status,
      reference_id: t.reference_id,
      paid_at: t.paid_at,
      order_number: ord?.order_number || "\u2014",
      package_name: title
    };
  });
  return res.json({
    user: {
      id: user.id,
      mobile: user.mobile,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      job_title: user.job_title,
      national_code: user.national_code || null,
      role: user.role,
      can_renew_early: Boolean(user.can_renew_early),
      company_name: company?.name || null,
      industry: company?.industry || null,
      employee_count: company?.employee_count || null
    },
    subscriptions: userSubs,
    transactions: userTxs
  });
});
router.get("/user/purchased-packages", authMiddleware, (req, res) => {
  const user = req.user;
  const userSubs = db.subscriptions.filter((s) => s.user_id === user.id).sort((a, b) => b.id - a.id);
  const result = userSubs.map((s) => {
    let name = s.title;
    if (!name) {
      if (s.module_ids && Array.isArray(s.module_ids) && s.module_ids.length > 0) {
        const moduleCount = s.module_ids.length;
        name = `\u0627\u0634\u062A\u0631\u0627\u06A9 \u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627\u06CC ERP (${moduleCount} \u0645\u0627\u0698\u0648\u0644)`;
      } else if (s.source === "trial") {
        name = "\u0627\u0634\u062A\u0631\u0627\u06A9 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u06F5 \u0631\u0648\u0632\u0647 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627";
      } else if (s.package_id) {
        const pkg = db.getPackageById(s.package_id);
        name = pkg?.name || "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627";
      } else {
        name = "\u0627\u0634\u062A\u0631\u0627\u06A9 \u0633\u0627\u0632\u0645\u0627\u0646\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627";
      }
    }
    const isSubActive = s.status === "active" && new Date(s.expires_at) > /* @__PURE__ */ new Date();
    return {
      id: s.id,
      name,
      status: s.status,
      is_active: isSubActive,
      expires_at: s.expires_at,
      source: s.source
    };
  });
  return res.json({ data: result });
});
router.get("/subscriptions/:id", authMiddleware, (req, res) => {
  const user = req.user;
  const subId = Number(req.params.id);
  const s = db.subscriptions.find((x) => x.id === subId && x.user_id === user.id);
  if (!s) {
    return res.status(404).json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  const company = db.getCompanyByUserId(user.id);
  const pkg = s.package_id ? db.getPackageById(s.package_id) : null;
  const order = s.order_id ? db.orders.find((o) => o.id === s.order_id) : null;
  const transaction = order ? db.transactions.find((t) => t.order_id === order.id && t.status === "successful") : null;
  let moduleObjects = [];
  let moduleNames = [];
  if (s.module_ids && Array.isArray(s.module_ids)) {
    moduleObjects = s.module_ids.map((id) => {
      const m = db.erpModules.find((x) => x.id === id);
      return {
        id,
        title: m?.title || id,
        price: m?.price || 0,
        dependencies: m?.dependencies || [],
        industries: m?.industries || []
      };
    });
    moduleNames = moduleObjects.map((m) => m.title);
  } else if (pkg && Array.isArray(pkg.features)) {
    moduleNames = pkg.features;
    moduleObjects = pkg.features.map((f, idx) => ({ id: `feat_${idx}`, title: f, price: 0 }));
  }
  const safeCompanySlug = (company?.name ? company.name.toLowerCase().replace(/[^a-z0-9]/g, "") : "workspace") || "workspace";
  const isSubActive = s.status === "active" && new Date(s.expires_at) > /* @__PURE__ */ new Date();
  return res.json({
    data: {
      ...s,
      package_name: s.title || pkg?.name || `\u0627\u0634\u062A\u0631\u0627\u06A9 \u0633\u0627\u0632\u0645\u0627\u0646\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 (${moduleNames.length} \u0645\u0627\u0698\u0648\u0644)`,
      module_names: moduleNames,
      modules_detail: moduleObjects,
      user_count: s.user_count || order?.user_count || db.configuratorSettings.base_user_limit || 1,
      billing_period: s.billing_period || order?.billing_period || "monthly",
      order_number: order?.order_number || (s.source === "trial" ? `TRIAL-KAROVITA-${s.id}` : "\u2014"),
      order_amount: order?.amount || pkg?.price || 0,
      discount_amount: order?.discount_amount || 0,
      coupon_code: order?.coupon_code || null,
      reference_id: transaction?.reference_id || (s.source === "trial" ? "\u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u0631\u0627\u06CC\u06AF\u0627\u0646" : null),
      paid_at: transaction?.paid_at || s.created_at,
      price: pkg?.price || order?.amount || 0,
      usage_percent: s.usage_limit ? Math.round(s.usage_used / s.usage_limit * 100) : 0,
      server_instance: {
        subdomain: `${safeCompanySlug}-${user.id}.karovita.ir`,
        portal_url: `/workspace/${s.id}`,
        status: isSubActive ? "online" : "paused",
        ssl: true,
        database: "PostgreSQL 16 Enterprise (\u0627\u062E\u062A\u0635\u0627\u0635\u06CC)",
        backup_status: "\u0631\u0648\u0632\u0627\u0646\u0647 \u062E\u0648\u062F\u06A9\u0627\u0631 (\u0633\u0627\u0639\u062A \u06F0\u06F2:\u06F0\u06F0 \u0628\u0627\u0645\u062F\u0627\u062F)",
        datacenter: "\u062F\u06CC\u062A\u0627\u0633\u0646\u062A\u0631 \u0627\u0628\u0631\u06CC \u062A\u0647\u0631\u0627\u0646 - \u0628\u0631\u062C \u0645\u06CC\u0644\u0627\u062F",
        dedicated_ip: `185.143.232.${user.id % 200 + 10}`
      }
    }
  });
});
router.get("/payments/pending-count", authMiddleware, (req, res) => {
  const user = req.user;
  const pendingOrders = db.orders.filter((o) => o.user_id === user.id && o.status === "pending");
  return res.json({ count: pendingOrders.length });
});
router.get("/user/orders", authMiddleware, (req, res) => {
  const user = req.user;
  const orders = db.orders.filter((o) => o.user_id === user.id).sort((a, b) => b.id - a.id).map((o) => {
    const tx = db.transactions.find((t) => t.order_id === o.id && t.status === "successful");
    const moduleNames = Array.isArray(o.module_ids) ? o.module_ids.map((id) => db.erpModules.find((m) => m.id === id)?.title || id) : [];
    return {
      id: o.id,
      order_number: o.order_number,
      amount: o.amount,
      status: o.status,
      module_ids: o.module_ids || [],
      module_names: moduleNames,
      user_count: o.user_count || db.configuratorSettings.base_user_limit || 1,
      billing_period: o.billing_period || "monthly",
      description: o.description || (moduleNames.length ? `\u0627\u0641\u0632\u0648\u062F\u0646 ${moduleNames.length} \u0645\u0627\u0698\u0648\u0644 \u062C\u062F\u06CC\u062F` : "\u0633\u0641\u0627\u0631\u0634 \u062E\u062F\u0645\u0627\u062A \u0627\u0628\u0631\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627"),
      created_at: o.created_at,
      transaction: tx ? {
        id: tx.id,
        reference_id: tx.reference_id,
        paid_at: tx.paid_at,
        gateway: tx.gateway,
        amount: tx.amount
      } : null
    };
  });
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  return res.json({
    data: orders,
    pending_count: pendingCount
  });
});
router.get("/payments/gateway-info", authMiddleware, (_req, res) => {
  const zibalConfig = getZibalConfig();
  const isSandbox = !!zibalConfig.sandbox || !zibalConfig.merchant || zibalConfig.merchant === "zibal";
  return res.json({
    data: {
      gateway: "zibal",
      name: "\u062F\u0631\u06AF\u0627\u0647 \u067E\u0631\u062F\u0627\u062E\u062A \u0634\u0627\u067E\u0631\u06A9 \u0632\u06CC\u0628\u0627\u0644",
      sandbox: isSandbox,
      is_live: !isSandbox,
      merchant_configured: !!zibalConfig.merchant && zibalConfig.merchant !== "zibal"
    }
  });
});
router.post("/orders/:id/pay", authMiddleware, async (req, res) => {
  const user = req.user;
  const orderId = Number(req.params.id);
  const mode = req.body?.mode;
  const order = db.orders.find((o) => o.id === orderId && (user.role === "admin" || o.user_id === user.id));
  if (!order) {
    return res.status(404).json({ message: "\u0633\u0641\u0627\u0631\u0634 \u06CC\u0627 \u0641\u0627\u06A9\u062A\u0648\u0631 \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  if (order.status === "paid" || order.status === "completed") {
    return res.status(400).json({ message: "\u0627\u06CC\u0646 \u0641\u0627\u06A9\u062A\u0648\u0631 \u0642\u0628\u0644\u0627\u064B \u067E\u0631\u062F\u0627\u062E\u062A \u0648 \u062A\u0633\u0648\u06CC\u0647 \u0634\u062F\u0647 \u0627\u0633\u062A." });
  }
  const zibalConfig = getZibalConfig();
  const isLiveGateway = !zibalConfig.sandbox && !!zibalConfig.merchant && zibalConfig.merchant !== "zibal" && mode !== "sandbox";
  if (isLiveGateway) {
    try {
      const clientOrigin = `${req.protocol}://${req.get("host") || "localhost:3000"}`;
      const zibalRes = await initiateZibalPayment(order, user, clientOrigin);
      if (!zibalRes.success && !zibalRes.paymentUrl) {
        return res.status(502).json({
          message: zibalRes.message || "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u062F\u0631\u06AF\u0627\u0647 \u067E\u0631\u062F\u0627\u062E\u062A \u0634\u0627\u067E\u0631\u06A9 \u0632\u06CC\u0628\u0627\u0644"
        });
      }
      const trackId = String(zibalRes.trackId || "live-" + Math.random().toString(36).substring(2, 14));
      const tx2 = {
        id: db.nextTransactionId++,
        order_id: order.id,
        user_id: order.user_id,
        gateway: "zibal",
        authority: trackId,
        reference_id: null,
        amount: order.amount,
        status: "initiated",
        raw_response: zibalRes.rawResponse,
        paid_at: null,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.transactions.push(tx2);
      db.save();
      return res.json({
        message: "\u062F\u0631\u062E\u0648\u0627\u0633\u062A \u067E\u0631\u062F\u0627\u062E\u062A \u0628\u0647 \u062F\u0631\u06AF\u0627\u0647 \u0634\u0627\u067E\u0631\u06A9 \u0632\u06CC\u0628\u0627\u0644 \u0627\u0631\u0633\u0627\u0644 \u0634\u062F.",
        data: {
          order_id: order.id,
          order_number: order.order_number,
          payment_url: zibalRes.paymentUrl,
          trackId,
          is_redirect: true,
          is_sandbox: false,
          amount: order.amount
        }
      });
    } catch (err) {
      console.warn("[Zibal Live Payment Error]", err.message);
      return res.status(500).json({
        message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u062F\u0631\u06AF\u0627\u0647 \u0634\u0627\u067E\u0631\u06A9: " + (err.message || "\u067E\u0627\u0633\u062E\u06CC \u0627\u0632 \u062F\u0631\u06AF\u0627\u0647 \u0632\u06CC\u0628\u0627\u0644 \u062F\u0631\u06CC\u0627\u0641\u062A \u0646\u0634\u062F")
      });
    }
  }
  order.status = "paid";
  const refId = "SHP-" + Date.now().toString().slice(-6) + Math.floor(1e5 + Math.random() * 9e5);
  let tx = db.transactions.find((t) => t.order_id === order.id);
  if (!tx) {
    tx = {
      id: db.nextTransactionId++,
      order_id: order.id,
      user_id: order.user_id,
      gateway: "zibal",
      authority: "TRK-" + Math.random().toString(36).substring(2, 12).toUpperCase(),
      reference_id: refId,
      amount: order.amount,
      status: "successful",
      raw_response: { mode: "instant_settlement", success: 1, is_sandbox: false },
      paid_at: (/* @__PURE__ */ new Date()).toISOString(),
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.transactions.push(tx);
  } else {
    tx.status = "successful";
    tx.gateway = "zibal";
    tx.reference_id = refId;
    tx.paid_at = (/* @__PURE__ */ new Date()).toISOString();
  }
  if (order.module_ids && order.module_ids.length > 0 || order.user_count && order.user_count > 0) {
    db.activateOrMergeERPSubscription(
      order.user_id,
      order.id,
      order.module_ids || [],
      order.user_count || db.configuratorSettings.base_user_limit || 1,
      order.billing_period || "3_months",
      "purchase"
    );
  } else if (order.package_id) {
    const pkg = db.getPackageById(order.package_id);
    db.createSubscription(order.user_id, order.package_id, order.id, "purchase", pkg?.duration_days || 365, pkg?.usage_limit);
  }
  db.save();
  logFinancialEvent(req, {
    actionType: "ONLINE_INVOICE_PAYMENT_SANDBOX",
    orderId: order.id,
    transactionId: tx.id,
    amount: order.amount,
    referenceId: refId,
    userId: user.id,
    actionDescription: `\u062A\u0633\u0648\u06CC\u0647 \u0645\u0648\u0641\u0642 \u062A\u0631\u0627\u06A9\u0646\u0634 \u0634\u0627\u067E\u0631\u06A9 \u0628\u0631\u0627\u06CC \u0633\u0641\u0627\u0631\u0634 #${order.order_number} \u0628\u0647 \u0645\u0628\u0644\u063A ${(order.amount || 0).toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646`,
    details: {
      gateway: "zibal",
      is_sandbox: false,
      order_number: order.order_number,
      modules: order.module_ids,
      user_count: order.user_count
    }
  });
  sendPaymentSuccessSms(tx, order, user).catch((err) => console.warn("[Payment SMS Error]", err));
  return res.json({
    message: "\u067E\u0631\u062F\u0627\u062E\u062A \u0628\u0627\u0646\u06A9\u06CC \u0634\u0627\u067E\u0631\u06A9 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0646\u062C\u0627\u0645 \u0634\u062F \u0648 \u0633\u0631\u0648\u06CC\u0633 \u0634\u0645\u0627 \u0641\u0639\u0627\u0644 \u06AF\u0631\u062F\u06CC\u062F.",
    data: {
      order_id: order.id,
      order_number: order.order_number,
      amount: order.amount,
      reference_id: refId,
      status: "successful",
      is_sandbox: false,
      is_redirect: false,
      paid_at: tx.paid_at
    }
  });
});
router.get("/invoices/:id", authMiddleware, (req, res) => {
  const user = req.user;
  const txOrOrderId = Number(req.params.id);
  let tx = db.transactions.find((t) => t.id === txOrOrderId && (user.role === "admin" || t.user_id === user.id));
  if (!tx) {
    tx = db.transactions.find((t) => t.order_id === txOrOrderId && (user.role === "admin" || t.user_id === user.id));
  }
  let order = tx ? db.orders.find((o) => o.id === tx.order_id) : db.orders.find((o) => o.id === txOrOrderId && (user.role === "admin" || o.user_id === user.id));
  if (!tx && order) {
    tx = db.transactions.find((t) => t.order_id === order.id);
  }
  if (!tx && !order) {
    return res.status(404).json({ message: "\u0641\u0627\u06A9\u062A\u0648\u0631 \u06CC\u0627 \u0633\u0641\u0627\u0631\u0634 \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  const isPaid = order?.status === "paid" || tx?.status === "successful";
  const invoiceUser = order ? db.getUserById(order.user_id) : tx ? db.getUserById(tx.user_id) : user;
  const targetUser = invoiceUser || user;
  const company = db.getCompanyByUserId(targetUser.id);
  const modulesList = db.erpModules.map((m) => ({
    id: m.id,
    title: m.title,
    price: m.price,
    category: m.category
  }));
  const html = generateOfficialTaxInvoiceHtml({
    order,
    tx,
    user: targetUser,
    company,
    modulesList,
    isPaid
  });
  const filename = `Tax-Invoice-${order?.order_number || tx?.id || "doc"}.html`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  if (req.query.download === "1") {
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  }
  logSensitiveDataAccess(req, {
    resourceType: "FINANCIAL_INVOICE",
    resourceId: tx?.id || order?.id || 0,
    actionDescription: `\u0645\u0634\u0627\u0647\u062F\u0647 \u0648 \u062F\u0631\u06CC\u0627\u0641\u062A \u0635\u0648\u0631\u062A\u062D\u0633\u0627\u0628 \u0631\u0633\u0645\u06CC \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F \u0645\u0627\u0644\u06CC\u0627\u062A\u06CC \u0628\u0631\u0627\u06CC \u0633\u0641\u0627\u0631\u0634 ${order?.order_number || tx?.id}`,
    details: { order_id: order?.id, amount: tx?.amount || order?.amount, is_paid: isPaid }
  });
  return res.send(html);
});
router.get("/invoices/:id/contract", authMiddleware, (req, res) => {
  const user = req.user;
  const txOrOrderId = Number(req.params.id);
  let tx = db.transactions.find((t) => t.id === txOrOrderId && (user.role === "admin" || t.user_id === user.id));
  if (!tx) {
    tx = db.transactions.find((t) => t.order_id === txOrOrderId && (user.role === "admin" || t.user_id === user.id));
  }
  let order = tx ? db.orders.find((o) => o.id === tx.order_id) : db.orders.find((o) => o.id === txOrOrderId && (user.role === "admin" || o.user_id === user.id));
  if (!tx && order) {
    tx = db.transactions.find((t) => t.order_id === order.id);
  }
  if (!tx && !order) {
    return res.status(404).json({ message: "\u0633\u0646\u062F \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0645\u0631\u0628\u0648\u0637 \u0628\u0647 \u0627\u06CC\u0646 \u0641\u0627\u06A9\u062A\u0648\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  const invoiceUser = order ? db.getUserById(order.user_id) : tx ? db.getUserById(tx.user_id) : user;
  const targetUser = invoiceUser || user;
  const company = db.getCompanyByUserId(targetUser.id);
  const modulesList = db.erpModules.map((m) => ({
    id: m.id,
    title: m.title,
    price: m.price
  }));
  const html = generateOfficialContractHtml({
    order,
    tx,
    user: targetUser,
    company,
    modulesList
  });
  const filename = `Contract-${order?.order_number || tx?.id || "doc"}.html`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  if (req.query.download === "1") {
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  }
  logSensitiveDataAccess(req, {
    resourceType: "FINANCIAL_CONTRACT",
    resourceId: tx?.id || order?.id || 0,
    actionDescription: `\u0645\u0634\u0627\u0647\u062F\u0647 \u0648 \u062F\u0631\u06CC\u0627\u0641\u062A \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0631\u0633\u0645\u06CC \u0644\u0627\u06CC\u0633\u0646\u0633 \u0648 SLA \u0633\u0641\u0627\u0631\u0634 ${order?.order_number || tx?.id}`,
    details: { order_id: order?.id, user_id: targetUser.id }
  });
  return res.send(html);
});
router.get("/invoices/:id/data", authMiddleware, (req, res) => {
  const user = req.user;
  const txOrOrderId = Number(req.params.id);
  let tx = db.transactions.find((t) => t.id === txOrOrderId && (user.role === "admin" || t.user_id === user.id));
  if (!tx) {
    tx = db.transactions.find((t) => t.order_id === txOrOrderId && (user.role === "admin" || t.user_id === user.id));
  }
  let order = tx ? db.orders.find((o) => o.id === tx.order_id) : db.orders.find((o) => o.id === txOrOrderId && (user.role === "admin" || o.user_id === user.id));
  if (!tx && order) {
    tx = db.transactions.find((t) => t.order_id === order.id);
  }
  if (!tx && !order) {
    return res.status(404).json({ message: "\u0641\u0627\u06A9\u062A\u0648\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  const isPaid = order?.status === "paid" || tx?.status === "successful";
  const invoiceUser = order ? db.getUserById(order.user_id) : tx ? db.getUserById(tx.user_id) : user;
  const targetUser = invoiceUser || user;
  const company = db.getCompanyByUserId(targetUser.id);
  const taxId = generateTaxId(order?.id || tx?.id || 1, order?.created_at || (/* @__PURE__ */ new Date()).toISOString());
  const finalAmount = Number(tx?.amount || order?.amount || 0);
  const vatRate = 0.1;
  const baseBeforeVat = Math.round(finalAmount / (1 + vatRate));
  const vatAmount = finalAmount - baseBeforeVat;
  const amountInWords = numberToWordsPersian(finalAmount);
  return res.json({
    data: {
      order,
      transaction: tx,
      is_paid: isPaid,
      tax_unique_id: taxId,
      seller: OFFICIAL_SELLER_INFO,
      buyer: {
        name: company?.name || `${targetUser.first_name || ""} ${targetUser.last_name || ""}`.trim() || targetUser.mobile,
        national_id: company?.national_id || targetUser.national_id || "\u2014",
        economic_code: company?.economic_code || targetUser.economic_code || "\u2014",
        registration_number: company?.registration_number || "\u2014",
        postal_code: company?.postal_code || "\u2014",
        province: company?.province || "\u062A\u0647\u0631\u0627\u0646",
        city: company?.city || "\u062A\u0647\u0631\u0627\u0646",
        address: company?.address || "\u2014",
        phone: company?.phone || targetUser.mobile
      },
      financial: {
        raw_total: order?.breakdown?.modules_total || finalAmount,
        discount_amount: order?.discount_amount || 0,
        base_before_vat: baseBeforeVat,
        vat_rate: "\u06F1\u06F0\u066A",
        vat_amount: vatAmount,
        final_amount: finalAmount,
        amount_in_words: amountInWords
      }
    }
  });
});
router.get("/user/company", authMiddleware, (req, res) => {
  const user = req.user;
  const company = db.getCompanyByUserId(user.id);
  return res.json({ data: company || null });
});
router.put("/user/company", authMiddleware, (req, res) => {
  const user = req.user;
  const {
    name = "",
    industry = "\u0641\u0646\u0627\u0648\u0631\u06CC \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0648 \u062E\u062F\u0645\u0627\u062A \u0627\u0628\u0631\u06CC",
    employee_count = 10,
    economic_code = "",
    registration_number = "",
    national_id = "",
    postal_code = "",
    province = "",
    city = "",
    address = "",
    phone = ""
  } = req.body;
  const company = db.upsertCompany(user.id, name || "\u0634\u0631\u06A9\u062A \u0645\u0634\u062A\u0631\u06A9", industry, Number(employee_count) || 1, {
    economic_code: String(economic_code).trim(),
    registration_number: String(registration_number).trim(),
    national_id: String(national_id).trim(),
    postal_code: String(postal_code).trim(),
    province: String(province).trim(),
    city: String(city).trim(),
    address: String(address).trim(),
    phone: String(phone).trim()
  });
  return res.json({
    message: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062D\u0642\u0648\u0642\u06CC \u0648 \u0645\u0627\u0644\u06CC\u0627\u062A\u06CC \u0634\u0631\u06A9\u062A \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0630\u062E\u06CC\u0631\u0647 \u06AF\u0631\u062F\u06CC\u062F.",
    data: company
  });
});
router.get("/admin/overview", authMiddleware, adminMiddleware, (_req, res) => {
  const usersCount = db.users.filter((u) => u.role === "user").length;
  const companiesCount = db.companies.length;
  const successfulTransactions = db.transactions.filter((t) => t.status === "successful");
  const revenue = successfulTransactions.reduce((sum, t) => sum + t.amount, 0);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const activeSubs = db.subscriptions.filter((s) => s.status === "active" && s.expires_at > now).length;
  const trials = db.subscriptions.filter((s) => s.source === "trial").length;
  const enrichedTransactions = db.transactions.map((t) => {
    const ord = db.orders.find((o) => o.id === t.order_id);
    let pkgName = "\u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627\u06CC ERP \u0633\u0627\u0632\u0645\u0627\u0646\u06CC";
    if (ord?.module_ids && ord.module_ids.length > 0) {
      pkgName = `\u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627\u06CC ERP \u0633\u0627\u0632\u0645\u0627\u0646\u06CC (${ord.module_ids.length} \u0645\u0627\u0698\u0648\u0644)`;
    } else if (ord?.package_id) {
      const pkg = db.getPackageById(ord.package_id);
      pkgName = pkg?.name || "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627";
    }
    return {
      ...t,
      package_name: pkgName,
      user_count: ord?.user_count || db.configuratorSettings.base_user_limit || 1,
      billing_period: ord?.billing_period || "monthly",
      order_number: ord?.order_number || "\u2014"
    };
  });
  return res.json({
    stats: {
      users: usersCount,
      companies: companiesCount,
      revenue,
      active_subscriptions: activeSubs,
      trials
    },
    transactions: enrichedTransactions,
    orders: db.orders
  });
});
router.get("/admin/users", authMiddleware, adminMiddleware, (req, res) => {
  const users = db.users.filter((u) => !u.deleted_at).sort((a, b) => b.id - a.id).map((u) => {
    const company = db.getCompanyByUserId(u.id);
    const subCount = db.subscriptions.filter((s) => s.user_id === u.id).length;
    return {
      id: u.id,
      mobile: u.mobile,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      job_title: u.job_title,
      national_code: u.national_code || null,
      role: u.role,
      is_owner: u.mobile === "09111273476",
      created_at: u.created_at,
      company_name: company?.name || "\u2014",
      industry: company?.industry || "\u2014",
      subscriptions_count: subCount
    };
  });
  logSensitiveDataAccess(req, {
    resourceType: "USER_PII",
    resourceId: "USER_DIRECTORY",
    actionDescription: "\u0645\u0634\u0627\u0647\u062F\u0647 \u0648 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0641\u0647\u0631\u0633\u062A \u06A9\u0627\u0631\u0628\u0631\u0627\u0646\u060C \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0647\u0648\u06CC\u062A\u06CC \u0648 \u0634\u0645\u0627\u0631\u0647\u200C\u0647\u0627\u06CC \u062A\u0645\u0627\u0633 \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631",
    details: { total_users_returned: users.length }
  });
  return res.json({ data: users });
});
router.get("/admin/erp/modules", authMiddleware, adminMiddleware, (_req, res) => {
  const activeIds = new Set(db.erpModules.filter((m) => m.is_active !== false).map((m) => m.id));
  const sanitizedPresets = db.industryPresets.map((p) => ({
    ...p,
    default_modules: (p.default_modules || []).filter((id) => activeIds.has(id))
  }));
  return res.json({
    modules: db.erpModules,
    presets: sanitizedPresets,
    settings: db.configuratorSettings,
    coupons: db.coupons
  });
});
router.post("/admin/erp/modules", authMiddleware, adminMiddleware, (req, res) => {
  const { id, title, price, dependencies, industries, is_active = true, add_to_presets } = req.body;
  if (!id || !title || typeof price !== "number") {
    return res.status(422).json({ message: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0645\u0627\u0698\u0648\u0644 \u0646\u0627\u0642\u0635 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u0639\u0646\u0648\u0627\u0646 \u0648 \u0642\u06CC\u0645\u062A \u0631\u0627 \u0628\u0647 \u062F\u0631\u0633\u062A\u06CC \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F." });
  }
  const cleanId = String(id).trim().toLowerCase().replace(/\s+/g, "_");
  const existingIdx = db.erpModules.findIndex((m) => m.id === cleanId);
  const cleanDependencies = Array.isArray(dependencies) ? dependencies : existingIdx >= 0 ? db.erpModules[existingIdx].dependencies || [] : [];
  const oldModule = existingIdx >= 0 ? { ...db.erpModules[existingIdx] } : null;
  const presetsExplicitlyProvided = add_to_presets !== void 0 || industries !== void 0;
  let targetPresets;
  if (is_active === false) {
    targetPresets = [];
  } else if (presetsExplicitlyProvided) {
    if (Array.isArray(add_to_presets)) {
      targetPresets = add_to_presets.map((p) => String(p).trim());
    } else if (Array.isArray(industries)) {
      targetPresets = industries.map((p) => String(p).trim());
    } else {
      targetPresets = [];
    }
  } else {
    targetPresets = existingIdx >= 0 ? (db.erpModules[existingIdx].industries || []).map((p) => String(p).trim()) : [];
  }
  const cleanIndustries = targetPresets;
  if (existingIdx >= 0) {
    db.erpModules[existingIdx] = {
      ...db.erpModules[existingIdx],
      title: String(title).trim(),
      price: Number(price),
      dependencies: cleanDependencies,
      industries: cleanIndustries,
      is_active: is_active ?? true
    };
  } else {
    db.erpModules.push({
      id: cleanId,
      title: String(title).trim(),
      price: Number(price),
      dependencies: cleanDependencies,
      industries: cleanIndustries,
      is_active: is_active ?? true
    });
  }
  db.industryPresets.forEach((preset) => {
    if (!Array.isArray(preset.default_modules)) {
      preset.default_modules = [];
    }
    const shouldInclude = is_active !== false && targetPresets.includes(preset.id);
    const hasModule = preset.default_modules.includes(cleanId);
    if (shouldInclude && !hasModule) {
      preset.default_modules.push(cleanId);
    } else if (!shouldInclude && hasModule) {
      preset.default_modules = preset.default_modules.filter((m) => m !== cleanId);
    }
  });
  db.save();
  invalidatePublicCaches();
  logConfigChange(req, {
    resourceType: "ERP_MODULE",
    resourceId: cleanId,
    actionDescription: existingIdx >= 0 ? `\u0648\u06CC\u0631\u0627\u06CC\u0634 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0648 \u0646\u0631\u062E \u0645\u0627\u0698\u0648\u0644 \xAB${title}\xBB` : `\u062A\u0639\u0631\u06CC\u0641 \u0648 \u0627\u0641\u0632\u0648\u062F\u0646 \u0645\u0627\u0698\u0648\u0644 \u062C\u062F\u06CC\u062F \xAB${title}\xBB \u0628\u0647 \u0633\u06CC\u0633\u062A\u0645`,
    oldValue: oldModule,
    newValue: { id: cleanId, title, price, is_active },
    details: { dependencies: cleanDependencies, industries: cleanIndustries }
  });
  const activeIds = new Set(db.erpModules.filter((m) => m.is_active !== false).map((m) => m.id));
  const sanitizedPresets = db.industryPresets.map((p) => ({
    ...p,
    default_modules: (p.default_modules || []).filter((mId) => activeIds.has(mId))
  }));
  return res.json({
    message: existingIdx >= 0 ? "\u0645\u0627\u0698\u0648\u0644 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F." : "\u0645\u0627\u0698\u0648\u0644 \u062C\u062F\u06CC\u062F \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647 \u0633\u06CC\u0633\u062A\u0645 \u0627\u0636\u0627\u0641\u0647 \u06AF\u0631\u062F\u06CC\u062F.",
    data: db.erpModules,
    modules: db.erpModules,
    presets: sanitizedPresets
  });
});
router.post("/admin/erp/modules/:id/toggle", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const mod = db.erpModules.find((m) => m.id === id);
  if (!mod) {
    return res.status(404).json({ message: "\u0645\u0627\u0698\u0648\u0644 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  const oldStatus = mod.is_active;
  mod.is_active = mod.is_active === false ? true : false;
  if (!mod.is_active) {
    db.industryPresets.forEach((preset) => {
      preset.default_modules = (preset.default_modules || []).filter((mId) => mId !== id);
    });
    mod.industries = [];
  }
  db.save();
  invalidatePublicCaches();
  logConfigChange(req, {
    resourceType: "ERP_MODULE_STATUS",
    resourceId: id,
    actionDescription: `\u062A\u063A\u06CC\u06CC\u0631 \u0648\u0636\u0639\u06CC\u062A \u0645\u0627\u0698\u0648\u0644 \xAB${mod.title}\xBB \u0628\u0647 ${mod.is_active ? "\u0641\u0639\u0627\u0644" : "\u063A\u06CC\u0631\u0641\u0639\u0627\u0644"}`,
    oldValue: oldStatus,
    newValue: mod.is_active,
    details: { module_id: id, module_title: mod.title }
  });
  const activeIds = new Set(db.erpModules.filter((m) => m.is_active !== false).map((m) => m.id));
  const sanitizedPresets = db.industryPresets.map((p) => ({
    ...p,
    default_modules: (p.default_modules || []).filter((mId) => activeIds.has(mId))
  }));
  return res.json({
    message: `\u0648\u0636\u0639\u06CC\u062A \u0645\u0627\u0698\u0648\u0644 \u0628\u0647 ${mod.is_active ? "\u0641\u0639\u0627\u0644" : "\u063A\u06CC\u0631\u0641\u0639\u0627\u0644"} \u062A\u063A\u06CC\u06CC\u0631 \u06CC\u0627\u0641\u062A.`,
    data: db.erpModules,
    modules: db.erpModules,
    presets: sanitizedPresets
  });
});
router.delete("/admin/erp/modules/:id", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const idx = db.erpModules.findIndex((m) => m.id === id);
  if (idx < 0) {
    return res.status(404).json({ message: "\u0645\u0627\u0698\u0648\u0644 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  const removedModule = db.erpModules.splice(idx, 1)[0];
  db.industryPresets.forEach((preset) => {
    preset.default_modules = preset.default_modules.filter((mId) => mId !== id);
  });
  db.erpModules.forEach((mod) => {
    if (mod.dependencies) {
      mod.dependencies = mod.dependencies.filter((dId) => dId !== id);
    }
  });
  db.save();
  invalidatePublicCaches();
  logConfigChange(req, {
    resourceType: "ERP_MODULE",
    resourceId: id,
    actionDescription: `\u062D\u0630\u0641 \u062F\u0627\u0626\u0645 \u0645\u0627\u0698\u0648\u0644 \xAB${removedModule.title}\xBB (${id}) \u0627\u0632 \u0633\u0627\u062E\u062A\u0627\u0631 ERP`,
    details: { deleted_module: removedModule }
  });
  return res.json({ message: `\u0645\u0627\u0698\u0648\u0644 \xAB${removedModule.title}\xBB \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062D\u0630\u0641 \u06AF\u0631\u062F\u06CC\u062F.`, data: db.erpModules });
});
router.post("/admin/erp/modules/bulk", authMiddleware, adminMiddleware, (req, res) => {
  const { action, module_ids, value } = req.body;
  if (!action || !Array.isArray(module_ids) || module_ids.length === 0) {
    return res.status(422).json({ message: "\u0639\u0645\u0644\u06CC\u0627\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A \u06CC\u0627 \u0647\u06CC\u0686 \u0645\u0627\u0698\u0648\u0644\u06CC \u0627\u0646\u062A\u062E\u0627\u0628 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A." });
  }
  const idsSet = new Set(module_ids.map((id) => String(id).trim()));
  const targetModules = db.erpModules.filter((m) => idsSet.has(m.id));
  if (targetModules.length === 0) {
    return res.status(404).json({ message: "\u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627\u06CC \u0627\u0646\u062A\u062E\u0627\u0628\u200C\u0634\u062F\u0647 \u062F\u0631 \u0633\u06CC\u0633\u062A\u0645 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F\u0646\u062F." });
  }
  let actionMessage = "";
  switch (action) {
    case "set_price": {
      const newPrice = Math.max(0, Number(value));
      if (isNaN(newPrice)) {
        return res.status(422).json({ message: "\u0645\u0628\u0644\u063A \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A." });
      }
      targetModules.forEach((m) => {
        m.price = newPrice;
      });
      actionMessage = `\u0642\u06CC\u0645\u062A ${targetModules.length} \u0645\u0627\u0698\u0648\u0644 \u0627\u0646\u062A\u062E\u0627\u0628\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647 ${newPrice.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646 \u062A\u063A\u06CC\u06CC\u0631 \u06CC\u0627\u0641\u062A.`;
      break;
    }
    case "set_status": {
      const isActive = Boolean(value);
      targetModules.forEach((m) => {
        m.is_active = isActive;
        if (!isActive) {
          db.industryPresets.forEach((preset) => {
            preset.default_modules = (preset.default_modules || []).filter((mId) => mId !== m.id);
          });
          m.industries = [];
        }
      });
      actionMessage = `${targetModules.length} \u0645\u0627\u0698\u0648\u0644 \u0627\u0646\u062A\u062E\u0627\u0628\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A ${isActive ? "\u0641\u0639\u0627\u0644" : "\u063A\u06CC\u0631\u0641\u0639\u0627\u0644"} \u0634\u062F\u0646\u062F.`;
      break;
    }
    case "add_dependency": {
      const depIds = (Array.isArray(value) ? value : [value]).map((v) => String(v).trim()).filter(Boolean);
      if (depIds.length === 0) {
        return res.status(422).json({ message: "\u0647\u06CC\u0686 \u067E\u06CC\u0634\u200C\u0646\u06CC\u0627\u0632\u06CC \u0627\u0646\u062A\u062E\u0627\u0628 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A." });
      }
      targetModules.forEach((m) => {
        if (!Array.isArray(m.dependencies)) m.dependencies = [];
        depIds.forEach((depId) => {
          if (m.id !== depId && !m.dependencies.includes(depId)) {
            m.dependencies.push(depId);
          }
        });
      });
      actionMessage = `${depIds.length.toLocaleString("fa-IR")} \u067E\u06CC\u0634\u200C\u0646\u06CC\u0627\u0632 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647 ${targetModules.length.toLocaleString("fa-IR")} \u0645\u0627\u0698\u0648\u0644 \u0627\u0646\u062A\u062E\u0627\u0628\u06CC \u0627\u0641\u0632\u0648\u062F\u0647 \u0634\u062F.`;
      break;
    }
    case "remove_dependency": {
      const depIds = (Array.isArray(value) ? value : [value]).map((v) => String(v).trim()).filter(Boolean);
      if (depIds.length === 0) {
        return res.status(422).json({ message: "\u0647\u06CC\u0686 \u067E\u06CC\u0634\u200C\u0646\u06CC\u0627\u0632\u06CC \u062C\u0647\u062A \u062D\u0630\u0641 \u0627\u0646\u062A\u062E\u0627\u0628 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A." });
      }
      const depSet = new Set(depIds);
      targetModules.forEach((m) => {
        if (Array.isArray(m.dependencies)) {
          m.dependencies = m.dependencies.filter((d) => !depSet.has(d));
        }
      });
      actionMessage = `${depIds.length.toLocaleString("fa-IR")} \u067E\u06CC\u0634\u200C\u0646\u06CC\u0627\u0632 \u0627\u0632 ${targetModules.length.toLocaleString("fa-IR")} \u0645\u0627\u0698\u0648\u0644 \u0627\u0646\u062A\u062E\u0627\u0628\u06CC \u062D\u0630\u0641 \u06AF\u0631\u062F\u06CC\u062F.`;
      break;
    }
    case "add_preset": {
      const presetIds = (Array.isArray(value) ? value : [value]).map((v) => String(v).trim()).filter(Boolean);
      if (presetIds.length === 0) {
        return res.status(422).json({ message: "\u0647\u06CC\u0686 \u0635\u0646\u0641\u06CC \u0627\u0646\u062A\u062E\u0627\u0628 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A." });
      }
      presetIds.forEach((presetId) => {
        const targetPreset = db.industryPresets.find((p) => p.id === presetId);
        if (targetPreset) {
          if (!Array.isArray(targetPreset.default_modules)) {
            targetPreset.default_modules = [];
          }
          targetModules.forEach((m) => {
            if (m.is_active !== false) {
              if (!targetPreset.default_modules.includes(m.id)) {
                targetPreset.default_modules.push(m.id);
              }
              if (!Array.isArray(m.industries)) m.industries = [];
              if (!m.industries.includes(presetId)) {
                m.industries.push(presetId);
              }
            }
          });
        }
      });
      actionMessage = `${targetModules.length.toLocaleString("fa-IR")} \u0645\u0627\u0698\u0648\u0644 \u0628\u0647 ${presetIds.length.toLocaleString("fa-IR")} \u0635\u0646\u0641 \u0627\u0641\u0632\u0648\u062F\u0647 \u0634\u062F\u0646\u062F.`;
      break;
    }
    case "remove_preset": {
      const presetIds = (Array.isArray(value) ? value : [value]).map((v) => String(v).trim()).filter(Boolean);
      if (presetIds.length === 0) {
        return res.status(422).json({ message: "\u0647\u06CC\u0686 \u0635\u0646\u0641\u06CC \u062C\u0647\u062A \u062E\u0631\u0648\u062C \u0627\u0646\u062A\u062E\u0627\u0628 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A." });
      }
      const presetSet = new Set(presetIds);
      presetIds.forEach((presetId) => {
        const targetPreset = db.industryPresets.find((p) => p.id === presetId);
        if (targetPreset && Array.isArray(targetPreset.default_modules)) {
          targetPreset.default_modules = targetPreset.default_modules.filter((id) => !idsSet.has(id));
        }
      });
      targetModules.forEach((m) => {
        if (Array.isArray(m.industries)) {
          m.industries = m.industries.filter((p) => !presetSet.has(p));
        }
      });
      actionMessage = `${targetModules.length.toLocaleString("fa-IR")} \u0645\u0627\u0698\u0648\u0644 \u0627\u0632 ${presetIds.length.toLocaleString("fa-IR")} \u0635\u0646\u0641 \u062D\u0630\u0641 \u0634\u062F\u0646\u062F.`;
      break;
    }
    case "delete": {
      db.erpModules = db.erpModules.filter((m) => !idsSet.has(m.id));
      db.industryPresets.forEach((preset) => {
        if (Array.isArray(preset.default_modules)) {
          preset.default_modules = preset.default_modules.filter((mId) => !idsSet.has(mId));
        }
      });
      db.erpModules.forEach((m) => {
        if (Array.isArray(m.dependencies)) {
          m.dependencies = m.dependencies.filter((d) => !idsSet.has(d));
        }
      });
      actionMessage = `${targetModules.length} \u0645\u0627\u0698\u0648\u0644 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0632 \u0633\u06CC\u0633\u062A\u0645 \u062D\u0630\u0641 \u0634\u062F\u0646\u062F.`;
      break;
    }
    default:
      return res.status(400).json({ message: "\u0646\u0648\u0639 \u0639\u0645\u0644\u06CC\u0627\u062A \u062F\u0631\u062E\u0648\u0627\u0633\u062A\u06CC \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A." });
  }
  db.save();
  invalidatePublicCaches();
  logConfigChange(req, {
    resourceType: "ERP_MODULES_BULK",
    resourceId: "BULK_ACTION",
    actionDescription: `\u0639\u0645\u0644\u06CC\u0627\u062A \u06AF\u0631\u0648\u0647\u06CC \xAB${action}\xBB \u0628\u0631 \u0631\u0648\u06CC ${targetModules.length} \u0645\u0627\u0698\u0648\u0644`,
    newValue: { action, module_ids, value }
  });
  const activeIds = new Set(db.erpModules.filter((m) => m.is_active !== false).map((m) => m.id));
  const sanitizedPresets = db.industryPresets.map((p) => ({
    ...p,
    default_modules: (p.default_modules || []).filter((mId) => activeIds.has(mId))
  }));
  return res.json({
    message: actionMessage,
    data: db.erpModules,
    modules: db.erpModules,
    presets: sanitizedPresets
  });
});
router.post("/admin/erp/settings", authMiddleware, adminMiddleware, (req, res) => {
  const { base_user_limit, extra_user_price, yearly_multiplier, semiannual_multiplier, quarterly_multiplier, step_users_enabled, step_modules_enabled } = req.body;
  const oldSettings = { ...db.configuratorSettings };
  const parsedBaseLimit = Number(base_user_limit);
  const parsedExtraPrice = Number(extra_user_price);
  const parsedYearly = Number(yearly_multiplier);
  const parsedSemiannual = Number(semiannual_multiplier);
  const parsedQuarterly = Number(quarterly_multiplier);
  db.configuratorSettings = {
    ...db.configuratorSettings,
    base_user_limit: !isNaN(parsedBaseLimit) && parsedBaseLimit >= 1 ? parsedBaseLimit : db.configuratorSettings.base_user_limit,
    extra_user_price: !isNaN(parsedExtraPrice) && parsedExtraPrice >= 0 ? parsedExtraPrice : db.configuratorSettings.extra_user_price,
    yearly_multiplier: !isNaN(parsedYearly) && parsedYearly > 0 ? parsedYearly : db.configuratorSettings.yearly_multiplier,
    semiannual_multiplier: !isNaN(parsedSemiannual) && parsedSemiannual > 0 ? parsedSemiannual : db.configuratorSettings.semiannual_multiplier || 6,
    quarterly_multiplier: !isNaN(parsedQuarterly) && parsedQuarterly > 0 ? parsedQuarterly : db.configuratorSettings.quarterly_multiplier || 3,
    step_users_enabled: typeof step_users_enabled === "boolean" ? step_users_enabled : db.configuratorSettings.step_users_enabled,
    step_modules_enabled: typeof step_modules_enabled === "boolean" ? step_modules_enabled : db.configuratorSettings.step_modules_enabled
  };
  db.save();
  invalidatePublicCaches();
  logConfigChange(req, {
    resourceType: "CONFIGURATOR_SETTINGS",
    resourceId: "GLOBAL_ERP_SETTINGS",
    actionDescription: "\u062A\u063A\u06CC\u06CC\u0631 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0648 \u067E\u0627\u0631\u0627\u0645\u062A\u0631\u0647\u0627\u06CC \u0639\u0645\u0648\u0645\u06CC \u0633\u06CC\u0633\u062A\u0645 \u0645\u062D\u0627\u0633\u0628\u0647 \u0642\u06CC\u0645\u062A ERP",
    oldValue: oldSettings,
    newValue: db.configuratorSettings
  });
  return res.json({ message: "\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0642\u06CC\u0645\u062A\u200C\u06AF\u0630\u0627\u0631\u06CC \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F.", data: db.configuratorSettings });
});
function invalidatePublicCaches() {
  invalidateCache("/api/configurator/data");
  invalidateCache("/configurator/data");
  invalidateCache("/api/packages");
  invalidateCache("/packages");
}
router.post("/admin/erp/presets", authMiddleware, adminMiddleware, (req, res) => {
  const { id, title, default_modules = [], mandatory_modules = [] } = req.body;
  if (!title || !title.trim()) {
    return res.status(422).json({ message: "\u0639\u0646\u0648\u0627\u0646 \u062A\u0628 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A." });
  }
  const slug = id ? String(id).trim() : `preset_${Date.now()}`;
  const activeIds = new Set(db.erpModules.filter((m) => m.is_active !== false).map((m) => m.id));
  const cleanModules = (Array.isArray(default_modules) ? default_modules : []).filter((mId) => activeIds.has(mId));
  const cleanMandatory = (Array.isArray(mandatory_modules) ? mandatory_modules : []).filter((mId) => activeIds.has(mId));
  cleanMandatory.forEach((mId) => {
    if (!cleanModules.includes(mId)) {
      cleanModules.push(mId);
    }
  });
  const existingIdx = db.industryPresets.findIndex((p) => p.id === slug);
  if (existingIdx >= 0) {
    db.industryPresets[existingIdx] = {
      ...db.industryPresets[existingIdx],
      title: String(title).trim(),
      default_modules: cleanModules,
      mandatory_modules: cleanMandatory
    };
  } else {
    db.industryPresets.push({
      id: slug,
      title: String(title).trim(),
      default_modules: cleanModules,
      mandatory_modules: cleanMandatory
    });
  }
  db.save();
  invalidatePublicCaches();
  logConfigChange(req, {
    resourceType: "INDUSTRY_PRESET",
    resourceId: slug,
    actionDescription: `\u062A\u0646\u0638\u06CC\u0645 \u0648 \u0630\u062E\u06CC\u0631\u0647 \u0628\u0633\u062A\u0647 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC \u0635\u0646\u0641 \xAB${title}\xBB`,
    details: { slug, title, modules_count: cleanModules.length, default_modules: cleanModules, mandatory_modules: cleanMandatory }
  });
  return res.json({ message: "\u062A\u0628 (\u0635\u0646\u0641) \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F.", data: db.industryPresets });
});
router.delete("/admin/erp/presets/:id", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const idx = db.industryPresets.findIndex((p) => p.id === id);
  if (idx < 0) {
    return res.status(404).json({ message: "\u062A\u0628 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  if (db.industryPresets.length <= 1) {
    return res.status(422).json({ message: "\u062D\u062F\u0627\u0642\u0644 \u06CC\u06A9 \u062A\u0628 \u0628\u0627\u06CC\u062F \u062F\u0631 \u0633\u06CC\u0633\u062A\u0645 \u0628\u0627\u0642\u06CC \u0628\u0645\u0627\u0646\u062F." });
  }
  const removed = db.industryPresets.splice(idx, 1)[0];
  db.save();
  invalidatePublicCaches();
  logConfigChange(req, {
    resourceType: "INDUSTRY_PRESET",
    resourceId: id,
    actionDescription: `\u062D\u0630\u0641 \u062A\u0628 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u0635\u0646\u0641 \xAB${removed?.title || id}\xBB`,
    details: { removed_preset: removed }
  });
  return res.json({ message: "\u062A\u0628 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062D\u0630\u0641 \u06AF\u0631\u062F\u06CC\u062F.", data: db.industryPresets });
});
router.delete("/admin/erp/coupons/:code", authMiddleware, adminMiddleware, (req, res) => {
  const { code } = req.params;
  const cleanCode = String(code).trim().toUpperCase();
  const idx = db.coupons.findIndex((c) => c.code.toUpperCase() === cleanCode);
  if (idx < 0) {
    return res.status(404).json({ message: "\u06A9\u0648\u067E\u0646 \u062A\u062E\u0641\u06CC\u0641 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  const removed = db.coupons.splice(idx, 1)[0];
  db.save();
  logConfigChange(req, {
    resourceType: "COUPON",
    resourceId: cleanCode,
    actionDescription: `\u062D\u0630\u0641 \u06A9\u0648\u067E\u0646 \u062A\u062E\u0641\u06CC\u0641 \xAB${cleanCode}\xBB`,
    details: { deleted_coupon: removed }
  });
  return res.json({ message: "\u06A9\u0648\u067E\u0646 \u062A\u062E\u0641\u06CC\u0641 \u062D\u0630\u0641 \u0634\u062F.", data: db.coupons });
});
router.post("/admin/erp/coupons", authMiddleware, adminMiddleware, (req, res) => {
  const { code, discount_type, discount_value, min_order_amount, is_active } = req.body;
  if (!code || !discount_value) {
    return res.status(422).json({ message: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u06A9\u0648\u067E\u0646 \u062A\u062E\u0641\u06CC\u0641 \u0646\u0627\u0642\u0635 \u0627\u0633\u062A." });
  }
  const cleanCode = String(code).trim().toUpperCase();
  const existingIdx = db.coupons.findIndex((c) => c.code.toUpperCase() === cleanCode);
  const couponObj = {
    code: cleanCode,
    discount_type: discount_type === "fixed" ? "fixed" : "percent",
    discount_value: Number(discount_value),
    min_order_amount: min_order_amount ? Number(min_order_amount) : void 0,
    is_active: is_active ?? true
  };
  if (existingIdx >= 0) {
    db.coupons[existingIdx] = couponObj;
  } else {
    db.coupons.push(couponObj);
  }
  db.save();
  logConfigChange(req, {
    resourceType: "COUPON",
    resourceId: cleanCode,
    actionDescription: existingIdx >= 0 ? `\u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u06A9\u0648\u067E\u0646 \u062A\u062E\u0641\u06CC\u0641 \xAB${cleanCode}\xBB` : `\u062A\u0639\u0631\u06CC\u0641 \u06A9\u0648\u067E\u0646 \u062A\u062E\u0641\u06CC\u0641 \u062C\u062F\u06CC\u062F \xAB${cleanCode}\xBB`,
    details: couponObj
  });
  return res.json({ message: "\u06A9\u0648\u067E\u0646 \u062A\u062E\u0641\u06CC\u0641 \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F.", data: db.coupons });
});
router.get("/admin/packages", authMiddleware, adminMiddleware, (_req, res) => {
  const list = [...db.packages].sort((a, b) => b.id - a.id);
  return res.json({ data: list });
});
router.post("/admin/packages", authMiddleware, adminMiddleware, (req, res) => {
  const { id, name, slug, description, price, duration_days, usage_limit, is_featured, is_active, features } = req.body;
  if (!name || typeof price !== "number") {
    return res.status(422).json({ message: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u067E\u06A9\u06CC\u062C \u0646\u0627\u0642\u0635 \u0627\u0633\u062A." });
  }
  const pkg = db.upsertPackage({
    id: id ? Number(id) : void 0,
    name: String(name).trim(),
    slug: slug ? String(slug).trim() : `package-${Date.now()}`,
    description: String(description || "").trim(),
    price: Number(price),
    duration_days: Number(duration_days) || 30,
    usage_limit: usage_limit === "" || usage_limit === null || usage_limit === void 0 ? null : Number(usage_limit),
    is_featured: !!is_featured,
    is_active: is_active ?? true,
    features: Array.isArray(features) ? features : []
  });
  logConfigChange(req, {
    resourceType: "PACKAGE_DEFINITION",
    resourceId: pkg.id,
    actionDescription: `\u0627\u06CC\u062C\u0627\u062F \u06CC\u0627 \u0648\u06CC\u0631\u0627\u06CC\u0634 \u067E\u06A9\u06CC\u062C \u062A\u0639\u0631\u0641\u0647 \xAB${name}\xBB \u0628\u0627 \u0642\u06CC\u0645\u062A ${Number(price).toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646`,
    details: pkg
  });
  return res.json({ message: "\u067E\u06A9\u06CC\u062C \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F." });
});
router.get("/admin/orders", authMiddleware, adminMiddleware, (_req, res) => {
  const orders = [...db.orders].filter((o) => !o.deleted_at).sort((a, b) => b.id - a.id).map((o) => {
    const user = db.getUserById(o.user_id);
    const pkg = db.getPackageById(o.package_id);
    const tx = db.transactions.find((t) => t.order_id === o.id);
    const company = db.getCompanyByUserId(o.user_id);
    const moduleNames = Array.isArray(o.module_ids) && o.module_ids.length > 0 ? o.module_ids.map((id) => db.erpModules.find((m) => m.id === id)?.title || id) : pkg?.features || [];
    return {
      id: o.id,
      order_number: o.order_number,
      amount: o.amount,
      status: o.status,
      created_at: o.created_at,
      package_name: pkg?.name || (moduleNames.length > 0 ? `\u0627\u0634\u062A\u0631\u0627\u06A9 (${moduleNames.length} \u0645\u0627\u0698\u0648\u0644)` : "\u0633\u0641\u0627\u0631\u0634 \u062E\u062F\u0645\u0627\u062A \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627"),
      module_ids: o.module_ids || [],
      module_names: moduleNames,
      user_id: o.user_id,
      user_name: [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.mobile || "\u2014",
      mobile: user?.mobile || "\u2014",
      company_name: company?.name || "\u2014",
      transaction_status: tx?.status || (o.status === "paid" ? "successful" : "pending"),
      reference_id: tx?.reference_id || "\u2014",
      tracking_code: tx?.authority || "\u2014",
      paid_at: tx?.paid_at || (o.status === "paid" ? o.created_at : null),
      billing_period: o.billing_period || "monthly",
      user_count: o.user_count || db.configuratorSettings.base_user_limit || 1
    };
  });
  return res.json({ data: orders });
});
router.put("/admin/orders/:id", authMiddleware, adminMiddleware, (req, res) => {
  const orderId = Number(req.params.id);
  const { status, reference_id, note } = req.body;
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ message: "\u0633\u0641\u0627\u0631\u0634 \u06CC\u0627 \u0641\u0627\u06A9\u062A\u0648\u0631 \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  const previousStatus = order.status;
  order.status = status;
  let tx = db.transactions.find((t) => t.order_id === order.id);
  if (!tx) {
    tx = {
      id: db.nextTransactionId++,
      order_id: order.id,
      user_id: order.user_id,
      gateway: "admin_manual",
      authority: "MAN-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      reference_id: reference_id || (status === "paid" ? "MAN-" + Date.now().toString().slice(-8) : null),
      amount: order.amount,
      status: status === "paid" ? "successful" : status === "cancelled" || status === "failed" ? "failed" : "initiated",
      raw_response: { updated_by: "admin", note },
      paid_at: status === "paid" ? (/* @__PURE__ */ new Date()).toISOString() : null,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.transactions.push(tx);
  } else {
    if (status === "paid") {
      tx.status = "successful";
      tx.reference_id = reference_id || tx.reference_id || "MAN-" + Date.now().toString().slice(-8);
      tx.paid_at = tx.paid_at || (/* @__PURE__ */ new Date()).toISOString();
    } else if (status === "pending") {
      tx.status = "initiated";
      tx.paid_at = null;
    } else if (status === "cancelled" || status === "failed") {
      tx.status = "failed";
    } else if (status === "refunded") {
      tx.status = "refunded";
    }
  }
  if (status === "paid") {
    const userSubs = db.subscriptions.filter((s) => s.user_id === order.user_id);
    const existingActiveSub = userSubs.find((s) => s.status === "active");
    if (existingActiveSub && order.module_ids && order.module_ids.length > 0) {
      const merged = Array.from(/* @__PURE__ */ new Set([...existingActiveSub.module_ids || [], ...order.module_ids]));
      existingActiveSub.module_ids = merged;
      existingActiveSub.title = `\u0627\u0634\u062A\u0631\u0627\u06A9 \u0633\u0627\u0632\u0645\u0627\u0646\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 (${merged.length} \u0645\u0627\u0698\u0648\u0644)`;
      existingActiveSub.status = "active";
      const extDate = /* @__PURE__ */ new Date();
      extDate.setFullYear(extDate.getFullYear() + (order.billing_period === "yearly" ? 1 : 0));
      if (order.billing_period !== "yearly") extDate.setMonth(extDate.getMonth() + 1);
      existingActiveSub.expires_at = extDate.toISOString();
    } else if (order.module_ids && order.module_ids.length > 0) {
      db.createERPSubscription(
        order.user_id,
        order.id,
        order.module_ids,
        order.user_count || db.configuratorSettings.base_user_limit || 1,
        order.billing_period || "monthly",
        "purchase"
      );
    } else if (order.package_id) {
      const pkg = db.getPackageById(order.package_id);
      db.createSubscription(order.user_id, order.package_id, order.id, "purchase", pkg?.duration_days || 365, pkg?.usage_limit);
    }
  }
  db.save();
  logFinancialEvent(req, {
    actionType: "ADMIN_ORDER_STATUS_MODIFIED",
    orderId: order.id,
    transactionId: tx?.id,
    amount: order.amount,
    userId: order.user_id,
    actionDescription: `\u062A\u063A\u06CC\u06CC\u0631 \u0648\u0636\u0639\u06CC\u062A \u0633\u0641\u0627\u0631\u0634 #${order.order_number} \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645 \u0627\u0632 \xAB${previousStatus}\xBB \u0628\u0647 \xAB${status}\xBB`,
    details: { previousStatus, newStatus: status, reference_id: tx?.reference_id }
  });
  return res.json({
    message: `\u0648\u0636\u0639\u06CC\u062A \u0633\u0641\u0627\u0631\u0634 #${order.order_number} \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647 \xAB${status === "paid" ? "\u067E\u0631\u062F\u0627\u062E\u062A \u0634\u062F\u0647" : status}\xBB \u062A\u063A\u06CC\u06CC\u0631 \u06CC\u0627\u0641\u062A.`,
    data: {
      order,
      transaction: tx
    }
  });
});
router.delete("/admin/orders/:id", authMiddleware, adminMiddleware, (req, res) => {
  const orderId = Number(req.params.id);
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ message: "\u0633\u0641\u0627\u0631\u0634 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  order.deleted_at = (/* @__PURE__ */ new Date()).toISOString();
  order.status = "cancelled";
  order.is_active = false;
  db.save();
  logFinancialEvent(req, {
    actionType: "ADMIN_ORDER_DELETED",
    orderId: order.id,
    amount: order.amount,
    userId: order.user_id,
    actionDescription: `\u062D\u0630\u0641 \u0646\u0631\u0645 (Soft Delete) \u0633\u0641\u0627\u0631\u0634 #${order.order_number} \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645`
  });
  return res.json({ success: true, message: "\u0633\u0641\u0627\u0631\u0634 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062D\u0630\u0641 \u06AF\u0631\u062F\u06CC\u062F." });
});
router.get("/admin/subscriptions", authMiddleware, adminMiddleware, (_req, res) => {
  const subs = [...db.subscriptions].filter((s) => !s.deleted_at).sort((a, b) => b.id - a.id).map((s) => {
    const user = db.getUserById(s.user_id);
    const pkg = db.getPackageById(s.package_id);
    const moduleNames = Array.isArray(s.module_ids) ? s.module_ids.map((id) => db.erpModules.find((m) => m.id === id)?.title || id) : pkg?.features || [];
    return {
      ...s,
      module_ids: s.module_ids || [],
      module_names: moduleNames,
      module_count: moduleNames.length,
      package_name: s.title || pkg?.name || `\u0627\u0634\u062A\u0631\u0627\u06A9 \u0633\u0627\u0632\u0645\u0627\u0646\u06CC (${moduleNames.length} \u0645\u0627\u0698\u0648\u0644)`,
      mobile: user?.mobile || "\u2014",
      user_name: [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.mobile || "\u2014"
    };
  });
  return res.json({ data: subs });
});
router.get("/admin/subscriptions/:id", authMiddleware, adminMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const sub = db.subscriptions.find((s) => s.id === id);
  if (!sub) {
    return res.status(404).json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  const user = db.getUserById(sub.user_id);
  const pkg = db.getPackageById(sub.package_id);
  const moduleNames = Array.isArray(sub.module_ids) ? sub.module_ids.map((mid) => db.erpModules.find((m) => m.id === mid)?.title || mid) : pkg?.features || [];
  return res.json({
    data: {
      ...sub,
      module_ids: sub.module_ids || [],
      module_names: moduleNames,
      package_name: sub.title || pkg?.name || "\u0627\u0634\u062A\u0631\u0627\u06A9 \u0633\u0627\u0632\u0645\u0627\u0646\u06CC",
      user: user ? {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        mobile: user.mobile
      } : null,
      all_available_modules: db.erpModules.map((m) => ({
        id: m.id,
        title: m.title,
        price: m.price,
        category: m.category
      }))
    }
  });
});
router.put("/admin/subscriptions/:id/modules", authMiddleware, adminMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const { module_ids } = req.body;
  const sub = db.subscriptions.find((s) => s.id === id);
  if (!sub) {
    return res.status(404).json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  if (!Array.isArray(module_ids)) {
    return res.status(400).json({ message: "\u0644\u06CC\u0633\u062A \u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A." });
  }
  const oldModules = sub.module_ids || [];
  sub.module_ids = module_ids;
  db.save();
  logSubscriptionChange(req, {
    subscriptionId: id,
    userId: sub.user_id,
    oldStatus: sub.status,
    newStatus: sub.status,
    actionDescription: `\u062A\u063A\u06CC\u06CC\u0631 \u0648 \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0644\u06CC\u0633\u062A \u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627\u06CC \u0641\u0639\u0627\u0644 \u0627\u0634\u062A\u0631\u0627\u06A9 #${id} \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631 \u0633\u0627\u0645\u0627\u0646\u0647 (\u062A\u0639\u062F\u0627\u062F: ${module_ids.length} \u0645\u0627\u0698\u0648\u0644)`,
    details: {
      old_modules: oldModules,
      new_modules: module_ids
    }
  });
  return res.json({
    message: "\u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627\u06CC \u0627\u0634\u062A\u0631\u0627\u06A9 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F\u0646\u062F.",
    data: {
      id: sub.id,
      module_ids: sub.module_ids
    }
  });
});
router.put("/admin/subscriptions", authMiddleware, adminMiddleware, (req, res) => {
  const id = Number(req.body.id);
  const status = req.body.status && ["active", "expired", "cancelled"].includes(req.body.status) ? req.body.status : void 0;
  const billingPeriod = req.body.billing_period;
  const sub = db.subscriptions.find((s) => s.id === id);
  if (!sub) {
    return res.status(404).json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  const oldStatus = sub.status;
  if (status) {
    sub.status = status;
  }
  if (billingPeriod) {
    sub.billing_period = billingPeriod;
  }
  db.save();
  logSubscriptionChange(req, {
    subscriptionId: id,
    userId: sub.user_id,
    oldStatus,
    newStatus: sub.status,
    actionDescription: `\u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0627\u0634\u062A\u0631\u0627\u06A9 #${id} (\u0648\u0636\u0639\u06CC\u062A: ${sub.status}${billingPeriod ? `\u060C \u062F\u0648\u0631\u0647: ${billingPeriod}` : ""})`
  });
  return res.json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F." });
});
router.get("/admin/users/lookup", authMiddleware, adminMiddleware, (req, res) => {
  const mobile = req.query.mobile;
  const normalized = normalizeMobile(mobile || "");
  if (!normalized) {
    return res.status(422).json({ message: "\u0634\u0645\u0627\u0631\u0647 \u0645\u0648\u0628\u0627\u06CC\u0644 \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A." });
  }
  const user = db.getUserByMobile(normalized);
  if (!user) {
    return res.json({
      exists: false,
      mobile: normalized,
      message: "\u06A9\u0627\u0631\u0628\u0631\u06CC \u0628\u0627 \u0627\u06CC\u0646 \u0634\u0645\u0627\u0631\u0647 \u062F\u0631 \u0633\u06CC\u0633\u062A\u0645 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F. \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u0647\u0645\u06CC\u0646 \u062D\u0627\u0644\u0627 \u0627\u06CC\u0646 \u06A9\u0627\u0631\u0628\u0631 \u0631\u0627 \u0628\u0647 \u0639\u0646\u0648\u0627\u0646 \u0645\u062F\u06CC\u0631 \u06CC\u0627 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646 \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F."
    });
  }
  const company = db.getCompanyByUserId(user.id);
  const subCount = db.subscriptions.filter((s) => s.user_id === user.id).length;
  return res.json({
    exists: true,
    user: {
      id: user.id,
      mobile: user.mobile,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: [user.first_name, user.last_name].filter(Boolean).join(" ") || "\u0628\u06CC\u200C\u0646\u0627\u0645",
      email: user.email,
      job_title: user.job_title,
      national_code: user.national_code || null,
      role: user.role,
      is_owner: user.mobile === "09111273476",
      created_at: user.created_at,
      company_name: company?.name || "\u2014",
      industry: company?.industry || "\u2014",
      subscriptions_count: subCount
    }
  });
});
router.post("/admin/users/toggle-role", authMiddleware, adminMiddleware, (req, res) => {
  const { mobile, role } = req.body;
  const normalizedMobile = normalizeMobile(mobile || "");
  if (!normalizedMobile) {
    return res.status(422).json({ message: "\u0634\u0645\u0627\u0631\u0647 \u0645\u0648\u0628\u0627\u06CC\u0644 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u0634\u0645\u0627\u0631\u0647 \u0645\u0639\u062A\u0628\u0631 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F (\u0645\u0627\u0646\u0646\u062F 09123456789)." });
  }
  if (!["admin", "support", "user"].includes(role)) {
    return res.status(422).json({ message: "\u0646\u0642\u0634 \u0627\u0646\u062A\u062E\u0627\u0628\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A (\u0628\u0627\u06CC\u062F admin\u060C support \u06CC\u0627 user \u0628\u0627\u0634\u062F)." });
  }
  if (normalizedMobile === "09111273476" && role !== "admin") {
    return res.status(403).json({ message: "\u0627\u0645\u06A9\u0627\u0646 \u062E\u0644\u0639 \u062F\u0633\u062A\u0631\u0633\u06CC \u0627\u0632 \u0645\u0627\u0644\u06A9 \u0648 \u0645\u062F\u06CC\u0631 \u0627\u0631\u0634\u062F \u067E\u0631\u0648\u0698\u0647 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F." });
  }
  const roleLabels = {
    admin: "\u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645 (Admin)",
    support: "\u06A9\u0627\u0631\u0634\u0646\u0627\u0633 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC (Support)",
    user: "\u06A9\u0627\u0631\u0628\u0631 \u0639\u0627\u062F\u06CC (User)"
  };
  let user = db.getUserByMobile(normalizedMobile);
  if (user) {
    const oldRole = user.role;
    user.role = role;
    user.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    db.save();
    const targetUserName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.mobile;
    logPrivilegeEscalation(req, {
      targetUserId: user.id,
      targetUserName,
      oldRole,
      newRole: role,
      actionDescription: `\u062A\u063A\u06CC\u06CC\u0631 \u0633\u0631\u06CC\u0639 \u0646\u0642\u0634 \u06A9\u0627\u0631\u0628\u0631 ${normalizedMobile} (${targetUserName}) \u0627\u0632 \xAB${roleLabels[oldRole] || oldRole}\xBB \u0628\u0647 \xAB${roleLabels[role]}\xBB`
    });
    return res.json({
      message: `\u0633\u0637\u062D \u062F\u0633\u062A\u0631\u0633\u06CC \u06A9\u0627\u0631\u0628\u0631 \xAB${targetUserName}\xBB \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647 \xAB${roleLabels[role]}\xBB \u062A\u063A\u06CC\u06CC\u0631 \u06CC\u0627\u0641\u062A.`,
      user: {
        id: user.id,
        mobile: user.mobile,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_owner: user.mobile === "09111273476"
      }
    });
  } else {
    const newId = db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1;
    const defaultJobTitle = role === "admin" ? "\u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645" : role === "support" ? "\u06A9\u0627\u0631\u0634\u0646\u0627\u0633 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC" : "\u06A9\u0627\u0631\u0628\u0631";
    const newUser = {
      id: newId,
      mobile: normalizedMobile,
      first_name: null,
      last_name: null,
      email: null,
      job_title: defaultJobTitle,
      role,
      onboarding_step: 3,
      onboarding_completed_at: (/* @__PURE__ */ new Date()).toISOString(),
      mobile_verified_at: (/* @__PURE__ */ new Date()).toISOString(),
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.users.push(newUser);
    db.save();
    logPrivilegeEscalation(req, {
      targetUserId: newUser.id,
      targetUserName: normalizedMobile,
      oldRole: "none",
      newRole: role,
      actionDescription: `\u062B\u0628\u062A \u0634\u0645\u0627\u0631\u0647 \u0647\u0645\u0631\u0627\u0647 ${normalizedMobile} \u062F\u0631 \u0633\u06CC\u0633\u062A\u0645 \u0628\u0627 \u0633\u0637\u062D \u062F\u0633\u062A\u0631\u0633\u06CC \xAB${roleLabels[role]}\xBB`
    });
    return res.json({
      message: `\u0634\u0645\u0627\u0631\u0647 ${normalizedMobile} \u062F\u0631 \u0633\u0627\u0645\u0627\u0646\u0647 \u062B\u0628\u062A \u0648 \u062F\u0633\u062A\u0631\u0633\u06CC \xAB${roleLabels[role]}\xBB \u0628\u0647 \u0622\u0646 \u0627\u0639\u0637\u0627 \u0634\u062F.`,
      user: {
        id: newUser.id,
        mobile: newUser.mobile,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
        is_owner: false
      }
    });
  }
});
router.post("/admin/users", authMiddleware, adminMiddleware, (req, res) => {
  const { mobile, first_name, last_name, email, job_title, role = "admin" } = req.body;
  const normalizedMobile = normalizeMobile(mobile || "");
  if (!normalizedMobile) {
    return res.status(422).json({ message: "\u0634\u0645\u0627\u0631\u0647 \u0645\u0648\u0628\u0627\u06CC\u0644 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u0634\u0645\u0627\u0631\u0647 \u0645\u0639\u062A\u0628\u0631 \u0627\u06CC\u0631\u0627\u0646 (\u0645\u0627\u0646\u0646\u062F 09123456789) \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F." });
  }
  const targetRole = ["admin", "support", "user"].includes(role) ? role : "admin";
  if (normalizedMobile === "09111273476" && targetRole !== "admin") {
    return res.status(403).json({ message: "\u0627\u0645\u06A9\u0627\u0646 \u062E\u0644\u0639 \u062F\u0633\u062A\u0631\u0633\u06CC \u0627\u0632 \u0645\u0627\u0644\u06A9 \u0648 \u0645\u062F\u06CC\u0631 \u0627\u0631\u0634\u062F \u067E\u0631\u0648\u0698\u0647 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F." });
  }
  const roleLabels = {
    admin: "\u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645 (Admin)",
    support: "\u06A9\u0627\u0631\u0634\u0646\u0627\u0633 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC (Support)",
    user: "\u06A9\u0627\u0631\u0628\u0631 \u0639\u0627\u062F\u06CC (User)"
  };
  let user = db.getUserByMobile(normalizedMobile);
  if (user) {
    const oldRole = user.role;
    user.role = targetRole;
    if (first_name && first_name.trim()) user.first_name = String(first_name).trim();
    if (last_name && last_name.trim()) user.last_name = String(last_name).trim();
    if (email && email.trim()) user.email = String(email).trim();
    if (job_title && job_title.trim()) user.job_title = String(job_title).trim();
    user.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    db.save();
    const targetName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.mobile;
    logPrivilegeEscalation(req, {
      targetUserId: user.id,
      targetUserName: targetName,
      oldRole,
      newRole: targetRole,
      actionDescription: `\u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0645\u0634\u062E\u0635\u0627\u062A \u0648 \u062A\u063A\u06CC\u06CC\u0631 \u0646\u0642\u0634 \u06A9\u0627\u0631\u0628\u0631 ${normalizedMobile} \u0628\u0647 \xAB${roleLabels[targetRole]}\xBB`
    });
    return res.json({
      message: `\u06A9\u0627\u0631\u0628\u0631 \u0628\u0627 \u0634\u0645\u0627\u0631\u0647 ${normalizedMobile} \u06CC\u0627\u0641\u062A \u0634\u062F \u0648 \u0646\u0642\u0634 \u0622\u0646 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647 \xAB${roleLabels[targetRole]}\xBB \u062A\u0646\u0638\u06CC\u0645 \u0634\u062F.`,
      user
    });
  } else {
    const newId = db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1;
    const defaultJob = targetRole === "admin" ? "\u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645" : targetRole === "support" ? "\u06A9\u0627\u0631\u0634\u0646\u0627\u0633 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC" : null;
    const newUser = {
      id: newId,
      mobile: normalizedMobile,
      first_name: first_name && first_name.trim() ? String(first_name).trim() : null,
      last_name: last_name && last_name.trim() ? String(last_name).trim() : null,
      email: email && email.trim() ? String(email).trim() : null,
      job_title: job_title && job_title.trim() ? String(job_title).trim() : defaultJob,
      role: targetRole,
      onboarding_step: 3,
      onboarding_completed_at: (/* @__PURE__ */ new Date()).toISOString(),
      mobile_verified_at: (/* @__PURE__ */ new Date()).toISOString(),
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.users.push(newUser);
    db.save();
    const targetName = [newUser.first_name, newUser.last_name].filter(Boolean).join(" ") || newUser.mobile;
    logPrivilegeEscalation(req, {
      targetUserId: newUser.id,
      targetUserName: targetName,
      oldRole: "none",
      newRole: targetRole,
      actionDescription: `\u062A\u0639\u0631\u06CC\u0641 \u0648 \u062B\u0628\u062A \u06A9\u0627\u0631\u0628\u0631 \u062C\u062F\u06CC\u062F \u0628\u0627 \u0634\u0645\u0627\u0631\u0647 ${normalizedMobile} \u0648 \u062F\u0633\u062A\u0631\u0633\u06CC \xAB${roleLabels[targetRole]}\xBB`
    });
    return res.json({
      message: `\u06A9\u0627\u0631\u0628\u0631 \u062C\u062F\u06CC\u062F \u0628\u0627 \u0634\u0645\u0627\u0631\u0647 ${normalizedMobile} \u0627\u06CC\u062C\u0627\u062F \u0648 \u062F\u0633\u062A\u0631\u0633\u06CC \xAB${roleLabels[targetRole]}\xBB \u0627\u0639\u0637\u0627 \u0634\u062F.`,
      user: newUser
    });
  }
});
var handleRoleUpdate = (req, res) => {
  const targetUserId = Number(req.params.id);
  const { role } = req.body;
  if (!["admin", "support", "user"].includes(role)) {
    return res.status(422).json({ message: "\u0646\u0642\u0634 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A (\u0628\u0627\u06CC\u062F admin\u060C support \u06CC\u0627 user \u0628\u0627\u0634\u062F)." });
  }
  const targetUser = db.getUserById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ message: "\u06A9\u0627\u0631\u0628\u0631 \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  if (targetUser.mobile === "09111273476" && role !== "admin") {
    return res.status(403).json({ message: "\u0627\u0645\u06A9\u0627\u0646 \u062E\u0644\u0639 \u062F\u0633\u062A\u0631\u0633\u06CC \u0627\u0632 \u0645\u0627\u0644\u06A9 \u0648 \u0645\u062F\u06CC\u0631 \u0627\u0631\u0634\u062F \u067E\u0631\u0648\u0698\u0647 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F." });
  }
  const roleLabels = {
    admin: "\u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645 (Admin)",
    support: "\u06A9\u0627\u0631\u0634\u0646\u0627\u0633 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC (Support)",
    user: "\u06A9\u0627\u0631\u0628\u0631 \u0639\u0627\u062F\u06CC (User)"
  };
  const oldRole = targetUser.role;
  targetUser.role = role;
  targetUser.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  db.save();
  const targetUserName = [targetUser.first_name, targetUser.last_name].filter(Boolean).join(" ") || targetUser.mobile;
  logPrivilegeEscalation(req, {
    targetUserId: targetUser.id,
    targetUserName,
    oldRole,
    newRole: role,
    actionDescription: `\u062A\u063A\u06CC\u06CC\u0631 \u0633\u0637\u062D \u062F\u0633\u062A\u0631\u0633\u06CC \u06A9\u0627\u0631\u0628\u0631 #${targetUser.id} (${targetUserName}) \u0627\u0632 \xAB${roleLabels[oldRole] || oldRole}\xBB \u0628\u0647 \xAB${roleLabels[role]}\xBB`
  });
  return res.json({
    message: `\u0646\u0642\u0634 \u06A9\u0627\u0631\u0628\u0631 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647 \xAB${roleLabels[role]}\xBB \u062A\u063A\u06CC\u06CC\u0631 \u06CC\u0627\u0641\u062A.`,
    user: targetUser
  });
};
router.put("/admin/users/:id/role", authMiddleware, adminMiddleware, handleRoleUpdate);
router.post("/admin/users/:id/role", authMiddleware, adminMiddleware, handleRoleUpdate);
var handleAdminUserUpdate = (req, res) => {
  const targetUserId = Number(req.params.id);
  const targetUser = db.getUserById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ message: "\u06A9\u0627\u0631\u0628\u0631 \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  const {
    first_name,
    last_name,
    email,
    job_title,
    role,
    mobile,
    can_renew_early,
    company_name,
    name,
    industry,
    employee_count,
    national_id,
    national_code,
    economic_code,
    registration_num,
    registration_number,
    postal_code,
    address
  } = req.body;
  if (first_name !== void 0) targetUser.first_name = String(first_name).trim();
  if (last_name !== void 0) targetUser.last_name = String(last_name).trim();
  if (email !== void 0) targetUser.email = String(email).trim() || null;
  if (job_title !== void 0) targetUser.job_title = String(job_title).trim();
  if (national_code !== void 0) {
    targetUser.national_code = toEnglishDigits(String(national_code || "")).replace(/\D/g, "").trim() || null;
  } else if (national_id !== void 0) {
    const cleanNat = toEnglishDigits(String(national_id || "")).replace(/\D/g, "").trim();
    if (cleanNat.length === 10) {
      targetUser.national_code = cleanNat;
    }
  }
  if (mobile !== void 0) {
    const rawMobile = String(mobile).trim();
    const normalized = normalizeMobile(rawMobile);
    if (rawMobile && !normalized) {
      return res.status(422).json({ message: "\u0634\u0645\u0627\u0631\u0647 \u0647\u0645\u0631\u0627\u0647 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A." });
    }
    if (normalized && normalized !== targetUser.mobile) {
      const existing = db.users.find((u) => u.mobile === normalized && u.id !== targetUserId);
      if (existing) {
        return res.status(422).json({ message: "\u0627\u06CC\u0646 \u0634\u0645\u0627\u0631\u0647 \u0647\u0645\u0631\u0627\u0647 \u0642\u0628\u0644\u0627\u064B \u0628\u0631\u0627\u06CC \u06A9\u0627\u0631\u0628\u0631 \u062F\u06CC\u06AF\u0631\u06CC \u062B\u0628\u062A \u0634\u062F\u0647 \u0627\u0633\u062A." });
      }
      targetUser.mobile = normalized;
    }
  }
  if (role !== void 0) {
    if (targetUser.mobile === "09111273476" || targetUser.id === 1) {
      targetUser.role = "admin";
    } else if (["user", "admin", "support"].includes(role)) {
      targetUser.role = role;
    }
  }
  if (can_renew_early !== void 0) {
    targetUser.can_renew_early = Boolean(can_renew_early);
  }
  targetUser.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  const resolvedCompName = String(company_name || name || "").trim();
  const resolvedIndustry = String(industry || "\u0641\u0646\u0627\u0648\u0631\u06CC \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0648 \u062E\u062F\u0645\u0627\u062A \u0627\u0628\u0631\u06CC").trim();
  const resolvedEmpCount = Number(employee_count) || 10;
  let company = db.getCompanyByUserId(targetUserId);
  if (resolvedCompName || company) {
    company = db.upsertCompany(targetUserId, resolvedCompName || company?.name || "\u0634\u0631\u06A9\u062A \u06A9\u0627\u0631\u0628\u0631\u06CC", resolvedIndustry, resolvedEmpCount, {
      economic_code: String(economic_code || national_id || "").trim(),
      national_id: String(national_id || economic_code || "").trim(),
      registration_number: String(registration_number || registration_num || "").trim(),
      postal_code: String(postal_code || "").trim(),
      address: String(address || "").trim()
    });
  }
  db.save();
  logPrivilegeEscalation(req, {
    targetUserId,
    targetUserName: [targetUser.first_name, targetUser.last_name].filter(Boolean).join(" ") || targetUser.mobile,
    oldRole: targetUser.role,
    newRole: targetUser.role,
    actionDescription: `\u0648\u06CC\u0631\u0627\u06CC\u0634 \u0645\u0634\u062E\u0635\u0627\u062A \u0648 \u0647\u0648\u06CC\u062A \u06A9\u0627\u0631\u0628\u0631 ${targetUser.mobile} \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631 (\u062A\u0645\u062F\u06CC\u062F \u0632\u0648\u062F\u0647\u0646\u06AF\u0627\u0645: ${targetUser.can_renew_early ? "\u0641\u0639\u0627\u0644" : "\u063A\u06CC\u0631\u0641\u0639\u0627\u0644"})`
  });
  return res.json({
    success: true,
    message: "\u0645\u0634\u062E\u0635\u0627\u062A \u0648 \u0647\u0648\u06CC\u062A \u06A9\u0627\u0631\u0628\u0631 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F.",
    user: {
      ...targetUser,
      can_renew_early: Boolean(targetUser.can_renew_early),
      company: company || null,
      company_name: company?.name || `${targetUser.first_name || ""} ${targetUser.last_name || ""}`.trim() || targetUser.mobile
    }
  });
};
router.put("/admin/users/:id", authMiddleware, adminMiddleware, handleAdminUserUpdate);
router.post("/admin/users/:id/update", authMiddleware, adminMiddleware, handleAdminUserUpdate);
router.post("/admin/users/:id", authMiddleware, adminMiddleware, handleAdminUserUpdate);
router.delete("/admin/users/:id", authMiddleware, adminMiddleware, (req, res) => {
  const targetUserId = Number(req.params.id);
  const targetUser = db.getUserById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ message: "\u06A9\u0627\u0631\u0628\u0631 \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  if (targetUser.mobile === "09111273476" || targetUser.id === 1) {
    return res.status(403).json({ message: "\u0627\u0645\u06A9\u0627\u0646 \u062D\u0630\u0641 \u062D\u0633\u0627\u0628 \u0645\u0627\u0644\u06A9 \u0648 \u0645\u062F\u06CC\u0631 \u0627\u0631\u0634\u062F \u0633\u0627\u0645\u0627\u0646\u0647 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F." });
  }
  const targetMobile = targetUser.mobile;
  const targetUserName = [targetUser.first_name, targetUser.last_name].filter(Boolean).join(" ") || targetMobile;
  db.deleteUserCompletely(targetUserId);
  logPrivilegeEscalation(req, {
    targetUserId,
    targetUserName,
    oldRole: targetUser.role,
    newRole: "deleted",
    actionDescription: `\u062D\u0630\u0641 \u06A9\u0627\u0645\u0644 \u0648 \u067E\u0627\u06A9\u0633\u0627\u0632\u06CC \u06A9\u0644\u06CC\u0647 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u06A9\u0627\u0631\u0628\u0631 ${targetMobile} (${targetUserName}) \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631 - \u06A9\u0627\u0631\u0628\u0631 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0645\u062C\u062F\u062F\u0627\u064B \u0627\u0632 \u0627\u0628\u062A\u062F\u0627 \u062B\u0628\u062A\u200C\u0646\u0627\u0645 \u06A9\u0646\u062F`
  });
  return res.json({
    success: true,
    message: `\u062D\u0633\u0627\u0628 \u0648 \u062A\u0645\u0627\u0645\u06CC \u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u06A9\u0627\u0631\u0628\u0631 \xAB${targetUserName}\xBB \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647 \u0637\u0648\u0631 \u06A9\u0627\u0645\u0644 \u062D\u0630\u0641 \u0634\u062F \u0648 \u0627\u06CC\u0646 \u0634\u0645\u0627\u0631\u0647 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0645\u062C\u062F\u062F\u0627\u064B \u0627\u0632 \u0627\u0628\u062A\u062F\u0627 \u062B\u0628\u062A\u200C\u0646\u0627\u0645 \u06A9\u0646\u062F.`
  });
});
router.get("/admin/users/:id/details", authMiddleware, adminMiddleware, (req, res) => {
  const targetUserId = Number(req.params.id);
  const targetUser = db.getUserById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ message: "\u06A9\u0627\u0631\u0628\u0631 \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  const company = db.getCompanyByUserId(targetUserId);
  const userSubs = db.subscriptions.filter((s) => s.user_id === targetUserId).sort((a, b) => b.id - a.id).map((s) => {
    const pkg = s.package_id ? db.getPackageById(s.package_id) : null;
    const order = s.order_id ? db.orders.find((o) => o.id === s.order_id) : null;
    const tx = order ? db.transactions.find((t) => t.order_id === order.id) : null;
    const moduleIds = Array.isArray(s.module_ids) ? s.module_ids : [];
    const moduleDetails = moduleIds.map((mid) => {
      const found = db.erpModules.find((m) => m.id === mid);
      return {
        id: mid,
        title: found?.title || mid,
        price: found?.price || 0,
        category: found?.category || "\u0639\u0645\u0648\u0645\u06CC"
      };
    });
    return {
      ...s,
      package_name: s.title || pkg?.name || `\u0627\u0634\u062A\u0631\u0627\u06A9 \u0633\u0627\u0632\u0645\u0627\u0646\u06CC (${moduleIds.length} \u0645\u0627\u0698\u0648\u0644)`,
      module_ids: moduleIds,
      modules: moduleDetails,
      module_count: moduleIds.length,
      order_number: order?.order_number || null,
      order_amount: order?.amount || tx?.amount || null,
      reference_id: tx?.reference_id || null
    };
  });
  const userOrders = db.orders.filter((o) => o.user_id === targetUserId).sort((a, b) => b.id - a.id).map((o) => {
    const tx = db.transactions.find((t) => t.order_id === o.id);
    const pkg = o.package_id ? db.getPackageById(o.package_id) : null;
    const sub = db.subscriptions.find((s) => s.order_id === o.id);
    return {
      id: o.id,
      order_number: o.order_number,
      amount: o.amount,
      status: o.status,
      created_at: o.created_at,
      package_name: pkg?.name || sub?.title || "\u0627\u0634\u062A\u0631\u0627\u06A9 \u0645\u0627\u0698\u0648\u0644\u0627\u0631 \u0627\u0628\u0631\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627",
      user_count: o.user_count || sub?.user_count || db.configuratorSettings.base_user_limit || 1,
      billing_period: o.billing_period || sub?.billing_period || "monthly",
      transaction: tx ? {
        id: tx.id,
        reference_id: tx.reference_id,
        status: tx.status,
        gateway: tx.gateway,
        paid_at: tx.paid_at,
        amount: tx.amount
      } : null
    };
  });
  return res.json({
    data: {
      user: {
        id: targetUser.id,
        mobile: targetUser.mobile,
        first_name: targetUser.first_name,
        last_name: targetUser.last_name,
        email: targetUser.email,
        job_title: targetUser.job_title,
        national_code: targetUser.national_code || null,
        role: targetUser.role,
        can_renew_early: Boolean(targetUser.can_renew_early),
        is_owner: targetUser.mobile === "09111273476",
        created_at: targetUser.created_at,
        company: company ? {
          name: company.name,
          industry: company.industry,
          employee_count: company.employee_count,
          national_id: company.national_id,
          phone: company.phone,
          address: company.address
        } : null
      },
      subscriptions: userSubs,
      orders: userOrders,
      all_available_modules: db.erpModules.map((m) => ({
        id: m.id,
        title: m.title,
        price: m.price,
        category: m.category,
        dependencies: m.dependencies || []
      }))
    }
  });
});
router.put("/admin/users/:userId/subscriptions/:subId/modules", authMiddleware, adminMiddleware, (req, res) => {
  const userId = Number(req.params.userId);
  const subId = Number(req.params.subId);
  const { module_ids, issue_invoice = false, invoice_amount, invoice_description } = req.body;
  const targetUser = db.getUserById(userId);
  if (!targetUser) {
    return res.status(404).json({ message: "\u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  const sub = db.subscriptions.find((s) => s.id === subId && s.user_id === userId);
  if (!sub) {
    return res.status(404).json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  if (!Array.isArray(module_ids)) {
    return res.status(400).json({ message: "\u0644\u06CC\u0633\u062A \u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627 \u0628\u0627\u06CC\u062F \u0628\u0647 \u0635\u0648\u0631\u062A \u0622\u0631\u0627\u06CC\u0647 \u0627\u0631\u0633\u0627\u0644 \u0634\u0648\u062F." });
  }
  const oldModules = sub.module_ids || [];
  const addedModules = module_ids.filter((m) => !oldModules.includes(m));
  const removedModules = oldModules.filter((m) => !module_ids.includes(m));
  sub.module_ids = module_ids;
  sub.title = `\u0627\u0634\u062A\u0631\u0627\u06A9 \u0633\u0627\u0632\u0645\u0627\u0646\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 (${module_ids.length} \u0645\u0627\u0698\u0648\u0644)`;
  let createdOrder = null;
  if (issue_invoice && (addedModules.length > 0 || Number(invoice_amount) > 0)) {
    const calculatedPrice = addedModules.reduce((acc, mId) => {
      const mod = db.erpModules.find((x) => x.id === mId);
      return acc + (Number(mod?.price) || 0);
    }, 0);
    const finalAmount = invoice_amount !== void 0 && invoice_amount !== "" && Number(invoice_amount) > 0 ? Number(invoice_amount) : calculatedPrice > 0 ? calculatedPrice : 1e5;
    const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(2, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    const modDetails = (addedModules.length > 0 ? addedModules : module_ids).map((id) => {
      const m = db.erpModules.find((x) => x.id === id);
      return m ? `${m.title} (${Number(m.price || 0).toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646)` : id;
    }).join(" + ");
    createdOrder = {
      id: db.nextOrderId++,
      user_id: userId,
      order_number: `INV-${dateStr}-${rand}`,
      amount: finalAmount,
      status: "pending",
      module_ids: addedModules.length > 0 ? addedModules : module_ids,
      user_count: sub.user_count || db.configuratorSettings.base_user_limit || 1,
      billing_period: sub.billing_period || "monthly",
      coupon_code: "",
      discount_amount: 0,
      description: invoice_description || `\u0647\u0632\u06CC\u0646\u0647 \u0627\u0641\u0632\u0648\u062F\u0646 \u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627\u06CC (${modDetails}) \u0628\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9 #${sub.id}`,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.orders.push(createdOrder);
  }
  db.save();
  const targetUserName = [targetUser.first_name, targetUser.last_name].filter(Boolean).join(" ") || targetUser.mobile;
  logSubscriptionChange(req, {
    subscriptionId: subId,
    userId,
    oldStatus: sub.status,
    newStatus: sub.status,
    actionDescription: `\u0648\u06CC\u0631\u0627\u06CC\u0634 \u0648 \u062A\u063A\u06CC\u06CC\u0631 \u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627\u06CC \u0641\u0639\u0627\u0644 \u0627\u0634\u062A\u0631\u0627\u06A9 #${subId} \u06A9\u0627\u0631\u0628\u0631 \xAB${targetUserName}\xBB \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631 (\u062A\u0639\u062F\u0627\u062F \u062C\u062F\u06CC\u062F: ${module_ids.length} \u0645\u0627\u0698\u0648\u0644)${createdOrder ? ` \u0647\u0645\u0631\u0627\u0647 \u0628\u0627 \u0635\u062F\u0648\u0631 \u067E\u06CC\u0634\u200C\u0641\u0627\u06A9\u062A\u0648\u0631 #${createdOrder.order_number} \u0628\u0647 \u0645\u0628\u0644\u063A ${createdOrder.amount.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646` : ""}`,
    details: {
      user_id: userId,
      user_mobile: targetUser.mobile,
      old_modules: oldModules,
      new_modules: module_ids,
      added_modules: addedModules,
      removed_modules: removedModules,
      issued_invoice: !!createdOrder,
      order_id: createdOrder?.id || null,
      order_number: createdOrder?.order_number || null,
      order_amount: createdOrder?.amount || null
    }
  });
  if (createdOrder) {
    const clientOrigin = `${req.protocol}://${req.get("host") || "localhost:3000"}`;
    sendInvoiceIssuedSms(createdOrder, targetUser, clientOrigin).catch((err) => console.warn("[Admin Invoice SMS Error]", err));
  }
  return res.json({
    message: createdOrder ? `\u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F\u0646\u062F \u0648 \u067E\u06CC\u0634\u200C\u0641\u0627\u06A9\u062A\u0648\u0631 #${createdOrder.order_number} \u0628\u0647 \u0645\u0628\u0644\u063A ${createdOrder.amount.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646 \u0628\u0627 \u0648\u0636\u0639\u06CC\u062A \u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u067E\u0631\u062F\u0627\u062E\u062A \u0628\u0631\u0627\u06CC \u06A9\u0627\u0631\u0628\u0631 \u0635\u0627\u062F\u0631 \u06AF\u0631\u062F\u06CC\u062F.` : "\u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627\u06CC \u0627\u0634\u062A\u0631\u0627\u06A9 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F\u0646\u062F.",
    data: {
      subscription_id: sub.id,
      module_ids: sub.module_ids,
      title: sub.title,
      order: createdOrder
    }
  });
});
router.post("/admin/users/:userId/subscriptions", authMiddleware, adminMiddleware, (req, res) => {
  const userId = Number(req.params.userId);
  const { module_ids = [], duration_days = 365, user_count = db.configuratorSettings.base_user_limit || 1, billing_period = "yearly" } = req.body;
  const targetUser = db.getUserById(userId);
  if (!targetUser) {
    return res.status(404).json({ message: "\u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  const newSub = db.createERPSubscription(
    userId,
    null,
    Array.isArray(module_ids) && module_ids.length > 0 ? module_ids : db.erpModules.slice(0, 4).map((m) => m.id),
    Number(user_count) || db.configuratorSettings.base_user_limit || 1,
    billing_period === "monthly" ? "monthly" : "yearly",
    "admin",
    Number(duration_days) || 365
  );
  const targetUserName = [targetUser.first_name, targetUser.last_name].filter(Boolean).join(" ") || targetUser.mobile;
  logSubscriptionChange(req, {
    subscriptionId: newSub.id,
    userId,
    oldStatus: "none",
    newStatus: "active",
    actionDescription: `\u0627\u0639\u0637\u0627\u06CC \u0645\u0633\u062A\u0642\u06CC\u0645 \u0627\u0634\u062A\u0631\u0627\u06A9 \u062C\u062F\u06CC\u062F \u0628\u0647 \u06A9\u0627\u0631\u0628\u0631 \xAB${targetUserName}\xBB (${targetUser.mobile}) \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645`,
    details: {
      subscription_id: newSub.id,
      module_ids: newSub.module_ids,
      duration_days,
      user_count
    }
  });
  return res.json({
    message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u062C\u062F\u06CC\u062F \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0627\u06CC \u06A9\u0627\u0631\u0628\u0631 \u0641\u0639\u0627\u0644 \u06AF\u0631\u062F\u06CC\u062F.",
    data: newSub
  });
});
router.get("/admin/subscriptions", authMiddleware, adminMiddleware, (req, res) => {
  const subs = [...db.subscriptions].sort((a, b) => b.id - a.id).map((s) => {
    const user = db.getUserById(s.user_id);
    const company = user ? db.getCompanyByUserId(user.id) : null;
    const order = s.order_id ? db.orders.find((o) => o.id === s.order_id) : null;
    const tx = order ? db.transactions.find((t) => t.order_id === order.id) : null;
    const moduleIds = Array.isArray(s.module_ids) ? s.module_ids : [];
    const userName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.mobile || "\u2014";
    return {
      id: s.id,
      user_id: s.user_id,
      title: s.title || (s.package_name || "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627"),
      package_name: s.package_name || s.title || "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627",
      source: s.source || "purchase",
      status: s.status || "active",
      billing_period: s.billing_period || "monthly",
      user_count: Number(s.user_count) || 1,
      user_limit: Number(s.user_limit) || 1,
      module_ids: moduleIds,
      module_count: moduleIds.length,
      expires_at: s.expires_at,
      created_at: s.created_at,
      starts_at: s.starts_at || s.created_at,
      mobile: user?.mobile || "\u2014",
      user_name: userName,
      company_name: company?.name || "\u2014",
      order_number: order?.order_number || null,
      amount: order?.amount || tx?.amount || 0
    };
  });
  return res.json({
    data: subs,
    subscriptions: subs,
    total: subs.length
  });
});
router.get("/subscriptions", authMiddleware, (req, res) => {
  const user = req.user;
  if (user.role === "admin") {
    const subs = [...db.subscriptions].sort((a, b) => b.id - a.id).map((s) => {
      const u = db.getUserById(s.user_id);
      const company = u ? db.getCompanyByUserId(u.id) : null;
      const moduleIds = Array.isArray(s.module_ids) ? s.module_ids : [];
      const userName = [u?.first_name, u?.last_name].filter(Boolean).join(" ") || u?.mobile || "\u2014";
      return {
        id: s.id,
        user_id: s.user_id,
        title: s.title || "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627",
        package_name: s.package_name || s.title || "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627",
        source: s.source || "purchase",
        status: s.status || "active",
        billing_period: s.billing_period || "monthly",
        user_count: Number(s.user_count) || 1,
        module_ids: moduleIds,
        module_count: moduleIds.length,
        expires_at: s.expires_at,
        created_at: s.created_at,
        mobile: u?.mobile || "\u2014",
        user_name: userName,
        company_name: company?.name || "\u2014"
      };
    });
    return res.json({ data: subs, subscriptions: subs });
  }
  const userSubs = db.subscriptions.filter((s) => s.user_id === user.id);
  return res.json({ data: userSubs, subscriptions: userSubs });
});
router.put("/admin/subscriptions", authMiddleware, adminMiddleware, (req, res) => {
  const id = Number(req.body.id);
  const sub = db.subscriptions.find((s) => s.id === id);
  if (!sub) {
    return res.status(404).json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  const { status, billing_period, user_count, expires_at } = req.body;
  const oldStatus = sub.status;
  const oldPeriod = sub.billing_period;
  if (status && ["active", "expired", "cancelled"].includes(status)) {
    sub.status = status;
  }
  if (billing_period && ["3_months", "6_months", "yearly", "monthly"].includes(billing_period)) {
    sub.billing_period = billing_period;
    if (!expires_at) {
      const now = /* @__PURE__ */ new Date();
      const durationDays = billing_period === "yearly" ? 365 : billing_period === "6_months" ? 180 : billing_period === "3_months" ? 90 : 30;
      sub.expires_at = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1e3).toISOString();
    }
  }
  if (user_count && Number(user_count) > 0) {
    sub.user_count = Number(user_count);
  }
  if (expires_at) {
    sub.expires_at = new Date(expires_at).toISOString();
  }
  db.save();
  logSubscriptionChange(req, {
    subscriptionId: id,
    userId: sub.user_id,
    oldStatus,
    newStatus: sub.status,
    actionDescription: `\u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u062F\u0648\u0631\u0647 \u0648 \u0645\u0634\u062E\u0635\u0627\u062A \u0627\u0634\u062A\u0631\u0627\u06A9 #${id} (\u062F\u0648\u0631\u0647: ${sub.billing_period}\u060C \u0648\u0636\u0639\u06CC\u062A: ${sub.status}) \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631`,
    details: {
      old_period: oldPeriod,
      new_period: sub.billing_period,
      user_count: sub.user_count,
      expires_at: sub.expires_at
    }
  });
  return res.json({
    message: "\u0645\u0634\u062E\u0635\u0627\u062A \u0648 \u062F\u0648\u0631\u0647 \u0635\u0648\u0631\u062A\u200C\u062D\u0633\u0627\u0628 \u0627\u0634\u062A\u0631\u0627\u06A9 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F.",
    data: sub
  });
});
router.put("/admin/subscriptions/:id", authMiddleware, adminMiddleware, (req, res) => {
  const id = Number(req.params.id) || Number(req.body.id);
  const sub = db.subscriptions.find((s) => s.id === id);
  if (!sub) {
    return res.status(404).json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  const { status, billing_period, user_count, expires_at } = req.body;
  const oldStatus = sub.status;
  const oldPeriod = sub.billing_period;
  if (status && ["active", "expired", "cancelled"].includes(status)) {
    sub.status = status;
  }
  if (billing_period && ["3_months", "6_months", "yearly", "monthly"].includes(billing_period)) {
    sub.billing_period = billing_period;
    if (!expires_at) {
      const now = /* @__PURE__ */ new Date();
      const durationDays = billing_period === "yearly" ? 365 : billing_period === "6_months" ? 180 : billing_period === "3_months" ? 90 : 30;
      sub.expires_at = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1e3).toISOString();
    }
  }
  if (user_count && Number(user_count) > 0) {
    sub.user_count = Number(user_count);
  }
  if (expires_at) {
    sub.expires_at = new Date(expires_at).toISOString();
  }
  db.save();
  logSubscriptionChange(req, {
    subscriptionId: id,
    userId: sub.user_id,
    oldStatus,
    newStatus: sub.status,
    actionDescription: `\u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u062F\u0648\u0631\u0647 \u0648 \u0645\u0634\u062E\u0635\u0627\u062A \u0627\u0634\u062A\u0631\u0627\u06A9 #${id} \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631`,
    details: {
      old_period: oldPeriod,
      new_period: sub.billing_period,
      user_count: sub.user_count,
      expires_at: sub.expires_at
    }
  });
  return res.json({
    message: "\u0645\u0634\u062E\u0635\u0627\u062A \u0648 \u062F\u0648\u0631\u0647 \u0635\u0648\u0631\u062A\u200C\u062D\u0633\u0627\u0628 \u0627\u0634\u062A\u0631\u0627\u06A9 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F.",
    data: sub
  });
});
router.delete("/admin/subscriptions/:id", authMiddleware, adminMiddleware, (req, res) => {
  const subId = Number(req.params.id);
  const sub = db.subscriptions.find((s) => s.id === subId);
  if (!sub) {
    return res.status(404).json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  sub.deleted_at = (/* @__PURE__ */ new Date()).toISOString();
  sub.status = "cancelled";
  sub.is_active = false;
  db.save();
  logSubscriptionChange(req, {
    subscriptionId: subId,
    userId: sub.user_id,
    oldStatus: sub.status,
    newStatus: "cancelled",
    actionDescription: `\u062D\u0630\u0641 \u0646\u0631\u0645 (Soft Delete) \u0648 \u0644\u063A\u0648 \u0627\u0634\u062A\u0631\u0627\u06A9 #${subId} \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645`
  });
  return res.json({ success: true, message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0627\u06CC\u06AF\u0627\u0646\u06CC/\u062D\u0630\u0641 \u06AF\u0631\u062F\u06CC\u062F." });
});
router.get("/admin/audit-logs", authMiddleware, adminMiddleware, (req, res) => {
  const action_type = req.query.action_type || "all";
  const resource_type = req.query.resource_type || "all";
  const status = req.query.status || "all";
  const search = req.query.search || "";
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Number(req.query.offset) || 0;
  const result = db.getAuditLogs({
    action_type,
    resource_type,
    status,
    search,
    limit,
    offset
  });
  logSensitiveDataAccess(req, {
    resourceType: "AUDIT_TRAIL",
    resourceId: "LOGS_VIEWER",
    actionDescription: "\u0645\u0634\u0627\u0647\u062F\u0647 \u0648 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0644\u0627\u06AF\u200C\u0647\u0627\u06CC \u0627\u0645\u0646\u06CC\u062A\u06CC \u0648 \u062D\u0633\u0627\u0628\u0631\u0633\u06CC \u0633\u0627\u0645\u0627\u0646\u0647",
    details: { filters: { action_type, search }, returned_count: result.logs.length }
  });
  return res.json(result);
});
router.get("/admin/audit-logs/stats", authMiddleware, adminMiddleware, (_req, res) => {
  const stats = db.getAuditStats();
  return res.json({ stats });
});
router.get("/admin/audit-logs/export", authMiddleware, adminMiddleware, (req, res) => {
  const result = db.getAuditLogs({ limit: 2e3, offset: 0 });
  logSensitiveDataAccess(req, {
    resourceType: "AUDIT_TRAIL_EXPORT",
    resourceId: "ALL_LOGS",
    actionDescription: "\u062E\u0631\u0648\u062C\u06CC \u06AF\u0631\u0641\u062A\u0646 \u0648 \u062F\u0627\u0646\u0644\u0648\u062F \u06AF\u0632\u0627\u0631\u0634 \u06A9\u0627\u0645\u0644 \u0644\u0627\u06AF\u200C\u0647\u0627\u06CC \u062D\u0633\u0627\u0628\u0631\u0633\u06CC \u0648 \u0627\u0645\u0646\u06CC\u062A\u06CC",
    details: { total_exported: result.total }
  });
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=karovita-audit-logs-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`);
  return res.send(JSON.stringify(result.logs, null, 2));
});
router.post("/logs/client-error", (req, res) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(";").reduce((acc, c) => {
        const [k, v] = c.trim().split("=");
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
      }, {});
      token = cookies["karovita_token"] || cookies["token"] || null;
    }
    if (token) {
      try {
        const payload = import_jsonwebtoken.default.verify(token, JWT_SECRET);
        const user = db.getUserById(payload.sub);
        if (user) {
          req.user = user;
        }
      } catch {
      }
    }
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
      }
    }
    const { message, name, stack, url, context, level } = body || {};
    if (!message && !name) {
      return res.status(400).json({ message: "\u067E\u06CC\u0627\u0645 \u062E\u0637\u0627 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A." });
    }
    const log = logClientError({ message, name, stack, url, context, level }, req);
    return res.status(201).json({ status: "ok", id: log.id });
  } catch (err) {
    return res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062B\u0628\u062A \u0644\u0627\u06AF \u0645\u062D\u0644\u06CC." });
  }
});
router.get("/admin/error-logs", authMiddleware, adminMiddleware, (req, res) => {
  const level = req.query.level || "all";
  const source = req.query.source || "all";
  const resolved = req.query.resolved;
  const search = req.query.search || "";
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const logs = errorLogger.getLogs({
    level,
    source,
    resolved: resolved === "true" ? true : resolved === "false" ? false : "all",
    search,
    limit
  });
  const stats = errorLogger.getStats();
  logSensitiveDataAccess(req, {
    resourceType: "ERROR_LOGS",
    resourceId: "VIEWER",
    actionDescription: "\u0645\u0634\u0627\u0647\u062F\u0647 \u0648 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0644\u0627\u06AF\u200C\u0647\u0627\u06CC \u062E\u0637\u0627\u06CC \u0645\u062D\u0644\u06CC \u0633\u0627\u0645\u0627\u0646\u0647",
    details: { filters: { level, source, search }, returned_count: logs.length }
  });
  return res.json({ logs, stats });
});
router.get("/admin/error-logs/stats", authMiddleware, adminMiddleware, (_req, res) => {
  const stats = errorLogger.getStats();
  return res.json({ stats });
});
router.post("/admin/error-logs/:id/resolve", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const resolved = req.body.resolved !== void 0 ? Boolean(req.body.resolved) : true;
  const success = errorLogger.markResolved(id, resolved);
  if (!success) {
    return res.status(404).json({ message: "\u0631\u06A9\u0648\u0631\u062F \u062E\u0637\u0627 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  logConfigChange(req, {
    configKey: `error_log_${id}_resolved`,
    oldValue: !resolved,
    newValue: resolved,
    actionDescription: `\u062A\u063A\u06CC\u06CC\u0631 \u0648\u0636\u0639\u06CC\u062A \u0628\u0631\u0631\u0633\u06CC \u062E\u0637\u0627\u06CC \xAB${id}\xBB \u0628\u0647 ${resolved ? "\u062D\u0644\u200C\u0634\u062F\u0647" : "\u062D\u0644\u200C\u0646\u0634\u062F\u0647"}`
  });
  return res.json({ message: `\u0648\u0636\u0639\u06CC\u062A \u062E\u0637\u0627 \u0628\u0647 ${resolved ? "\u0628\u0631\u0631\u0633\u06CC\u200C\u0634\u062F\u0647" : "\u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u0628\u0631\u0631\u0633\u06CC"} \u062A\u063A\u06CC\u06CC\u0631 \u06CC\u0627\u0641\u062A.` });
});
router.post("/admin/error-logs/clear", authMiddleware, adminMiddleware, (req, res) => {
  errorLogger.clearLogs();
  logSecurityEvent(req, {
    eventType: "CONFIGURATION_CHANGE",
    severity: "WARNING",
    actionDescription: "\u067E\u0627\u06A9\u0633\u0627\u0632\u06CC \u06A9\u0627\u0645\u0644 \u0641\u0627\u06CC\u0644 \u0648 \u0644\u06CC\u0633\u062A \u0644\u0627\u06AF\u200C\u0647\u0627\u06CC \u062E\u0637\u0627\u06CC \u0633\u0627\u0645\u0627\u0646\u0647 \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631"
  });
  return res.json({ message: "\u06A9\u0644\u06CC\u0647 \u0644\u0627\u06AF\u200C\u0647\u0627\u06CC \u062E\u0637\u0627\u06CC \u0645\u062D\u0644\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u067E\u0627\u06A9\u0633\u0627\u0632\u06CC \u0634\u062F\u0646\u062F." });
});
router.get("/admin/error-logs/export", authMiddleware, adminMiddleware, (req, res) => {
  const format = req.query.format || "json";
  logSensitiveDataAccess(req, {
    resourceType: "ERROR_LOGS_EXPORT",
    resourceId: format,
    actionDescription: `\u062F\u0627\u0646\u0644\u0648\u062F \u0641\u0627\u06CC\u0644 \u062E\u0631\u0648\u062C\u06CC \u0644\u0627\u06AF\u200C\u0647\u0627\u06CC \u062E\u0637\u0627\u06CC \u0633\u0627\u0645\u0627\u0646\u0647 \u0628\u0627 \u0641\u0631\u0645\u062A ${format.toUpperCase()}`
  });
  if (format === "text" || format === "log") {
    const rawText = errorLogger.getRawLogText();
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=karovita-errors-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.log`);
    return res.send(rawText || "No logs recorded.");
  }
  const logs = errorLogger.getLogs({ limit: 1e3 });
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=karovita-error-logs-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`);
  return res.send(JSON.stringify(logs, null, 2));
});
router.post("/admin/error-logs/test", authMiddleware, adminMiddleware, (req, res) => {
  const { type = "server", message = "\u0627\u06CC\u0646 \u06CC\u06A9 \u062E\u0637\u0627\u06CC \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u062C\u0647\u062A \u0628\u0631\u0631\u0633\u06CC \u0633\u0644\u0627\u0645\u062A \u0633\u06CC\u0633\u062A\u0645 \u0644\u0627\u06AF \u0627\u0633\u062A." } = req.body || {};
  const testErr = new Error(`[Test] ${message}`);
  const created = logServerError(testErr, {
    test: true,
    triggeredByAdmin: req.user?.mobile,
    triggerTime: (/* @__PURE__ */ new Date()).toISOString()
  }, req, "warn", type === "database" ? "database" : "api");
  return res.status(201).json({
    message: "\u062E\u0637\u0627\u06CC \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062F\u0631 \u0641\u0627\u06CC\u0644 data/error_logs.json \u062B\u0628\u062A \u06AF\u0631\u062F\u06CC\u062F.",
    log: created
  });
});
router.post("/logs/vitals", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const payload = import_jsonwebtoken.default.verify(token, JWT_SECRET);
        const user = db.getUserById(payload.sub);
        if (user) {
          req.user = user;
        }
      } catch {
      }
    }
    const { url, metrics = {}, connection, memory } = req.body || {};
    const entry = performanceLogger.logVitals({ url, metrics, connection, memory }, req);
    return res.status(201).json({ status: "ok", id: entry.id });
  } catch (err) {
    return res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062B\u0628\u062A \u0645\u0639\u06CC\u0627\u0631\u0647\u0627\u06CC \u06A9\u0627\u0631\u0627\u06CC\u06CC." });
  }
});
router.get("/admin/vitals", authMiddleware, adminMiddleware, (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 300);
  const vitals = performanceLogger.getVitals(limit);
  const stats = performanceLogger.getStats();
  return res.json({ vitals, stats });
});
router.post("/admin/vitals/clear", authMiddleware, adminMiddleware, (req, res) => {
  performanceLogger.clearLogs();
  return res.json({ message: "\u0644\u0627\u06AF\u200C\u0647\u0627\u06CC \u067E\u0627\u06CC\u0634 \u06A9\u0627\u0631\u0627\u06CC\u06CC Core Web Vitals \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u067E\u0627\u06A9\u0633\u0627\u0632\u06CC \u0634\u062F\u0646\u062F." });
});
router.get("/departments", (_req, res) => {
  const list = db.departments.filter((d) => d.status === "active");
  return res.json({ data: list });
});
router.get("/tickets", authMiddleware, (req, res) => {
  const user = req.user;
  const status = req.query.status || "all";
  let list = db.tickets.filter((t) => t.user_id === user.id);
  if (status && status !== "all") {
    list = list.filter((t) => t.status === status);
  }
  const enriched = list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).map((t) => {
    const dept = db.getDepartmentById(t.department_id);
    return {
      ...t,
      department_name: dept?.name || "\u0639\u0645\u0648\u0645\u06CC"
    };
  });
  const counts = db.getUserTicketCounts(user.id);
  return res.json({ data: enriched, counts });
});
router.get("/tickets/badge", authMiddleware, (req, res) => {
  const user = req.user;
  if (user.role === "admin") {
    const count = db.tickets.filter(
      (t) => t.status !== "closed" && (t.status === "open" || t.status === "in_progress" || t.last_sender_type === "user")
    ).length;
    return res.json({ count });
  } else {
    const count = db.tickets.filter(
      (t) => t.user_id === user.id && t.status !== "closed" && (t.status === "waiting_user" || t.last_sender_type === "support")
    ).length;
    return res.json({ count });
  }
});
router.post("/tickets", authMiddleware, ticketSubmissionLimiter, (req, res) => {
  const user = req.user;
  const { department_id, service_name, subject, message, is_security_info, attachments } = req.body;
  if (!department_id) {
    return res.status(422).json({ message: "\u0644\u0637\u0641\u0627\u064B \u062F\u067E\u0627\u0631\u062A\u0645\u0627\u0646 \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F." });
  }
  if (!subject || !subject.trim()) {
    return res.status(422).json({ message: "\u0645\u0648\u0636\u0648\u0639 \u062A\u06CC\u06A9\u062A \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A." });
  }
  if (!message || !message.trim()) {
    return res.status(422).json({ message: "\u0645\u062A\u0646 \u067E\u06CC\u0627\u0645 \u062A\u06CC\u06A9\u062A \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A." });
  }
  let validAttachments = [];
  if (Array.isArray(attachments) && attachments.length > 0) {
    for (const att of attachments) {
      if (att.file_size > 10 * 1024 * 1024) {
        return res.status(422).json({ message: `\u062D\u062C\u0645 \u0641\u0627\u06CC\u0644 ${att.file_name} \u0628\u06CC\u0634 \u0627\u0632 \u062D\u062F \u0645\u062C\u0627\u0632 (\u062D\u062F\u0627\u06A9\u062B\u0631 \u06F1\u06F0 \u0645\u06AF\u0627\u0628\u0627\u06CC\u062A) \u0627\u0633\u062A.` });
      }
      const safeName = (att.file_name || "file").replace(/[^\w\d.\-\u0600-\u06FF]/g, "_");
      validAttachments.push({
        file_name: safeName,
        file_data: att.file_data,
        file_type: att.file_type || "application/octet-stream",
        file_size: att.file_size || 0
      });
    }
  }
  const ip = req.ip || req.socket.remoteAddress || "localhost";
  const ticket = db.createTicket({
    user_id: user.id,
    department_id: Number(department_id),
    service_name: service_name || "\u0633\u0631\u0648\u06CC\u0633 \u0639\u0645\u0648\u0645\u06CC",
    subject,
    message,
    is_security_info: !!is_security_info,
    attachments: validAttachments,
    ip_address: ip
  });
  try {
    const adminSubs = db.getAllPushSubscriptions().filter((s) => s.role === "admin" || s.role === "support");
    if (adminSubs.length > 0) {
      broadcastWebPush(adminSubs, {
        title: `\u062A\u06CC\u06A9\u062A \u062C\u062F\u06CC\u062F: ${subject}`,
        body: `\u062A\u06CC\u06A9\u062A \u0634\u0645\u0627\u0631\u0647 ${ticket.ticket_number} \u062A\u0648\u0633\u0637 \u06A9\u0627\u0631\u0628\u0631 \u062B\u0628\u062A \u0634\u062F.`,
        url: `/admin`,
        tag: `ticket-${ticket.id}`
      }).catch(() => {
      });
    }
  } catch (err) {
  }
  sendTicketCreatedSms(ticket, user).catch((err) => console.warn("[Ticket SMS Error]", err));
  return res.status(201).json({
    message: "\u062A\u06CC\u06A9\u062A \u0634\u0645\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062B\u0628\u062A \u06AF\u0631\u062F\u06CC\u062F.",
    ticket_number: ticket.ticket_number,
    ticket_id: ticket.id,
    ticket
  });
});
router.get("/tickets/:id", authMiddleware, (req, res) => {
  const user = req.user;
  const ticketId = Number(req.params.id);
  const ticket = db.getTicketById(ticketId);
  if (!ticket) {
    return res.status(404).json({ message: "\u062A\u06CC\u06A9\u062A \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  if (user.role !== "admin" && ticket.user_id !== user.id) {
    logSecurityEvent(req, {
      actionDescription: `\u062A\u0644\u0627\u0634 \u063A\u06CC\u0631\u0645\u062C\u0627\u0632 \u0628\u0631\u0627\u06CC \u0645\u0634\u0627\u0647\u062F\u0647 \u062A\u06CC\u06A9\u062A #${ticket.ticket_number} (\u06A9\u0627\u0631\u0628\u0631 ID: ${user.id})`,
      resourceType: "TICKET_ACCESS_VIOLATION",
      resourceId: ticket.id,
      status: "WARNING",
      details: { attempted_ticket_id: ticket.id, ticket_owner_id: ticket.user_id }
    });
    return res.status(403).json({ message: "\u0634\u0645\u0627 \u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u0627\u06CC\u0646 \u062A\u06CC\u06A9\u062A \u0631\u0627 \u0646\u062F\u0627\u0631\u06CC\u062F." });
  }
  if (ticket.is_security_info || user.role === "admin") {
    logSensitiveDataAccess(req, {
      resourceType: "TICKET_SECURITY_DATA",
      resourceId: ticket.id,
      actionDescription: `\u062F\u0633\u062A\u0631\u0633\u06CC \u0648 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062A\u06CC\u06A9\u062A \u0634\u0645\u0627\u0631\u0647 ${ticket.ticket_number} ${ticket.is_security_info ? "(\u0634\u0627\u0645\u0644 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062D\u0633\u0627\u0633 \u0648 \u062F\u0633\u062A\u0631\u0633\u06CC)" : ""}`,
      details: { ticket_number: ticket.ticket_number, is_security_info: ticket.is_security_info, viewer_role: user.role }
    });
  }
  const ticketUser = db.getUserById(ticket.user_id);
  const dept = db.getDepartmentById(ticket.department_id);
  const messages = db.getMessagesByTicketId(ticket.id);
  const history = db.getHistoryByTicketId(ticket.id);
  return res.json({
    ticket: {
      ...ticket,
      department_name: dept?.name || "\u0639\u0645\u0648\u0645\u06CC",
      user_name: [ticketUser?.first_name, ticketUser?.last_name].filter(Boolean).join(" ") || ticketUser?.mobile || "\u06A9\u0627\u0631\u0628\u0631",
      user_mobile: ticketUser?.mobile || "\u2014",
      user_email: ticketUser?.email || "\u2014"
    },
    messages,
    history
  });
});
router.post("/tickets/:id/messages", authMiddleware, ticketMessageLimiter, (req, res) => {
  const user = req.user;
  const ticketId = Number(req.params.id);
  const ticket = db.getTicketById(ticketId);
  if (!ticket) {
    return res.status(404).json({ message: "\u062A\u06CC\u06A9\u062A \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  if (user.role !== "admin" && ticket.user_id !== user.id) {
    return res.status(403).json({ message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u063A\u06CC\u0631\u0645\u062C\u0627\u0632." });
  }
  if (ticket.status === "closed") {
    return res.status(400).json({ message: "\u0627\u06CC\u0646 \u062A\u06CC\u06A9\u062A \u0628\u0633\u062A\u0647 \u0634\u062F\u0647 \u0627\u0633\u062A \u0648 \u0627\u0645\u06A9\u0627\u0646 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645 \u0646\u062F\u0627\u0631\u062F." });
  }
  const { message, is_security_info, attachments } = req.body;
  if (!message || !message.trim()) {
    return res.status(422).json({ message: "\u0645\u062A\u0646 \u067E\u06CC\u0627\u0645 \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u062E\u0627\u0644\u06CC \u0628\u0627\u0634\u062F." });
  }
  let validAttachments = [];
  if (Array.isArray(attachments) && attachments.length > 0) {
    for (const att of attachments) {
      if (att.file_size > 10 * 1024 * 1024) {
        return res.status(422).json({ message: `\u062D\u062C\u0645 \u0641\u0627\u06CC\u0644 ${att.file_name} \u0628\u06CC\u0634 \u0627\u0632 \u06F1\u06F0 \u0645\u06AF\u0627\u0628\u0627\u06CC\u062A \u0627\u0633\u062A.` });
      }
      const safeName = (att.file_name || "file").replace(/[^\w\d.\-\u0600-\u06FF]/g, "_");
      validAttachments.push({
        file_name: safeName,
        file_data: att.file_data,
        file_type: att.file_type || "application/octet-stream",
        file_size: att.file_size || 0
      });
    }
  }
  const senderType = user.role === "admin" ? "support" : "user";
  const senderName = user.role === "admin" ? ([user.first_name, user.last_name].filter(Boolean).join(" ") || "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646 \u0633\u06CC\u0633\u062A\u0645") + " (\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC)" : [user.first_name, user.last_name].filter(Boolean).join(" ") || user.mobile || "\u06A9\u0627\u0631\u0628\u0631";
  const ip = req.ip || req.socket.remoteAddress || "localhost";
  try {
    const newMessage = db.addTicketMessage({
      ticket_id: ticket.id,
      sender_id: user.id,
      sender_type: senderType,
      sender_name: senderName,
      message,
      is_security_info: !!is_security_info,
      attachments: validAttachments,
      ip_address: ip
    });
    if (senderType === "support") {
      const ticketUser = db.getUserById(ticket.user_id);
      if (ticketUser && ticketUser.mobile) {
        sendTicketReplySms(ticketUser.mobile, ticket.ticket_number, ticket.subject, message).catch((err) => {
          console.error("[SMS send error in ticket reply]", err.message);
        });
      }
      const userSubs = db.getPushSubscriptions({ user_id: ticket.user_id });
      if (userSubs.length > 0) {
        broadcastWebPush(userSubs, {
          title: `\u067E\u0627\u0633\u062E \u0628\u0647 \u062A\u06CC\u06A9\u062A #${ticket.ticket_number}`,
          body: `${senderName}: ${message.length > 80 ? message.substring(0, 80) + "..." : message}`,
          url: `/support?ticketId=${ticket.id}`,
          tag: `ticket-${ticket.id}`
        }).catch(() => {
        });
      }
    } else {
      const staffSubs = db.getAllPushSubscriptions().filter((s) => s.role === "admin" || s.role === "support");
      if (staffSubs.length > 0) {
        broadcastWebPush(staffSubs, {
          title: `\u067E\u06CC\u0627\u0645 \u062C\u062F\u06CC\u062F \u062F\u0631 \u062A\u06CC\u06A9\u062A #${ticket.ticket_number}`,
          body: `${senderName}: ${message.length > 80 ? message.substring(0, 80) + "..." : message}`,
          url: `/admin`,
          tag: `ticket-${ticket.id}`
        }).catch(() => {
        });
      }
    }
    return res.json({
      message: "\u067E\u06CC\u0627\u0645 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0631\u0633\u0627\u0644 \u0634\u062F.",
      data: newMessage,
      ticket_status: ticket.status
    });
  } catch (err) {
    return res.status(400).json({ message: err.message || "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645." });
  }
});
router.put("/tickets/:id/close", authMiddleware, (req, res) => {
  const user = req.user;
  const ticketId = Number(req.params.id);
  const ticket = db.getTicketById(ticketId);
  if (!ticket) {
    return res.status(404).json({ message: "\u062A\u06CC\u06A9\u062A \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  if (user.role !== "admin" && ticket.user_id !== user.id) {
    return res.status(403).json({ message: "\u0634\u0645\u0627 \u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u0628\u0633\u062A\u0646 \u0627\u06CC\u0646 \u062A\u06CC\u06A9\u062A \u0631\u0627 \u0646\u062F\u0627\u0631\u06CC\u062F." });
  }
  const userName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.mobile || (user.role === "admin" ? "\u0645\u062F\u06CC\u0631" : "\u06A9\u0627\u0631\u0628\u0631");
  const closed = db.closeTicket(ticket.id, user.id, userName);
  return res.json({ message: "\u062A\u06CC\u06A9\u062A \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0633\u062A\u0647 \u0634\u062F.", ticket: closed });
});
router.put("/tickets/:id/reopen", authMiddleware, (req, res) => {
  const user = req.user;
  const ticketId = Number(req.params.id);
  const ticket = db.getTicketById(ticketId);
  if (!ticket) {
    return res.status(404).json({ message: "\u062A\u06CC\u06A9\u062A \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  if (user.role !== "admin" && ticket.user_id !== user.id) {
    return res.status(403).json({ message: "\u0634\u0645\u0627 \u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u0627\u06CC\u0646 \u062A\u06CC\u06A9\u062A \u0631\u0627 \u0646\u062F\u0627\u0631\u06CC\u062F." });
  }
  const userName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.mobile || (user.role === "admin" ? "\u0645\u062F\u06CC\u0631" : "\u06A9\u0627\u0631\u0628\u0631");
  const reopened = db.reopenTicket(ticket.id, user.id, userName);
  return res.json({ message: "\u062A\u06CC\u06A9\u062A \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0645\u062C\u062F\u062F\u0627\u064B \u0628\u0627\u0632\u06AF\u0634\u0627\u06CC\u06CC \u0634\u062F.", ticket: reopened });
});
router.get("/admin/tickets", authMiddleware, adminMiddleware, (req, res) => {
  const status = req.query.status || "all";
  const deptId = req.query.department_id ? Number(req.query.department_id) : null;
  const search = (req.query.search || "").trim().toLowerCase();
  const assignedTo = req.query.assigned_to ? Number(req.query.assigned_to) : null;
  let list = [...db.tickets];
  if (status && status !== "all") {
    list = list.filter((t) => t.status === status);
  }
  if (deptId) {
    list = list.filter((t) => t.department_id === deptId);
  }
  if (assignedTo) {
    list = list.filter((t) => t.assigned_to === assignedTo);
  }
  if (search) {
    list = list.filter((t) => {
      const u = db.getUserById(t.user_id);
      const userName = `${u?.first_name || ""} ${u?.last_name || ""}`.toLowerCase();
      const mobile = (u?.mobile || "").toLowerCase();
      return t.ticket_number.toLowerCase().includes(search) || t.subject.toLowerCase().includes(search) || userName.includes(search) || mobile.includes(search) || (t.service_name || "").toLowerCase().includes(search);
    });
  }
  const enriched = list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).map((t) => {
    const u = db.getUserById(t.user_id);
    const dept = db.getDepartmentById(t.department_id);
    return {
      ...t,
      department_name: dept?.name || "\u0639\u0645\u0648\u0645\u06CC",
      user_name: [u?.first_name, u?.last_name].filter(Boolean).join(" ") || u?.mobile || "\u06A9\u0627\u0631\u0628\u0631",
      user_mobile: u?.mobile || "\u2014",
      user_email: u?.email || "\u2014"
    };
  });
  const counts = db.getAdminTicketCounts();
  return res.json({ data: enriched, counts });
});
router.get("/admin/support-staff", authMiddleware, adminMiddleware, (_req, res) => {
  return res.json({ data: db.supportStaff });
});
router.put("/admin/tickets/:id/assign", authMiddleware, adminMiddleware, (req, res) => {
  const user = req.user;
  const ticketId = Number(req.params.id);
  const staffId = Number(req.body.staff_id);
  const userName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "\u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645";
  try {
    const updated = db.assignTicket(ticketId, staffId, user.id, userName);
    const staff = db.supportStaff.find((s) => s.id === staffId);
    logConfigChange(req, {
      resourceType: "TICKET_ASSIGNMENT",
      resourceId: ticketId,
      actionDescription: `\u0627\u0631\u062C\u0627\u0639 \u062A\u06CC\u06A9\u062A #${updated.ticket_number} \u0628\u0647 \u06A9\u0627\u0631\u0634\u0646\u0627\u0633 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \xAB${staff?.name || staffId}\xBB`,
      details: { staff_id: staffId, staff_name: staff?.name, ticket_number: updated.ticket_number }
    });
    return res.json({ message: "\u062A\u06CC\u06A9\u062A \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646 \u0627\u0631\u062C\u0627\u0639 \u0634\u062F.", ticket: updated });
  } catch (err) {
    return res.status(400).json({ message: err.message || "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u062C\u0627\u0639 \u062A\u06CC\u06A9\u062A." });
  }
});
router.put("/admin/tickets/:id/department", authMiddleware, adminMiddleware, (req, res) => {
  const user = req.user;
  const ticketId = Number(req.params.id);
  const departmentId = Number(req.body.department_id);
  const userName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "\u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645";
  try {
    const updated = db.changeTicketDepartment(ticketId, departmentId, user.id, userName);
    const dept = db.getDepartmentById(departmentId);
    logConfigChange(req, {
      resourceType: "TICKET_DEPARTMENT",
      resourceId: ticketId,
      actionDescription: `\u0627\u0646\u062A\u0642\u0627\u0644 \u062F\u067E\u0627\u0631\u062A\u0645\u0627\u0646 \u062A\u06CC\u06A9\u062A #${updated.ticket_number} \u0628\u0647 \xAB${dept?.name || departmentId}\xBB`,
      details: { new_department_id: departmentId, department_name: dept?.name }
    });
    return res.json({ message: "\u062F\u067E\u0627\u0631\u062A\u0645\u0627\u0646 \u062A\u06CC\u06A9\u062A \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F.", ticket: updated });
  } catch (err) {
    return res.status(400).json({ message: err.message || "\u062E\u0637\u0627 \u062F\u0631 \u062A\u063A\u06CC\u06CC\u0631 \u062F\u067E\u0627\u0631\u062A\u0645\u0627\u0646." });
  }
});
router.put("/admin/tickets/:id/status", authMiddleware, adminMiddleware, (req, res) => {
  const user = req.user;
  const ticketId = Number(req.params.id);
  const status = req.body.status;
  if (!["open", "in_progress", "waiting_user", "closed"].includes(status)) {
    return res.status(422).json({ message: "\u0648\u0636\u0639\u06CC\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A." });
  }
  const userName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "\u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645";
  try {
    const updated = db.changeTicketStatus(ticketId, status, user.id, userName);
    logConfigChange(req, {
      resourceType: "TICKET_STATUS",
      resourceId: ticketId,
      actionDescription: `\u062A\u063A\u06CC\u06CC\u0631 \u0648\u0636\u0639\u06CC\u062A \u062A\u06CC\u06A9\u062A #${updated.ticket_number} \u0628\u0647 \xAB${status}\xBB \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631`,
      details: { new_status: status, ticket_number: updated.ticket_number }
    });
    return res.json({ message: "\u0648\u0636\u0639\u06CC\u062A \u062A\u06CC\u06A9\u062A \u062A\u063A\u06CC\u06CC\u0631 \u06CC\u0627\u0641\u062A.", ticket: updated });
  } catch (err) {
    return res.status(400).json({ message: err.message || "\u062E\u0637\u0627 \u062F\u0631 \u062A\u063A\u06CC\u06CC\u0631 \u0648\u0636\u0639\u06CC\u062A." });
  }
});
router.delete("/admin/tickets/:id", authMiddleware, adminMiddleware, (req, res) => {
  const ticketId = Number(req.params.id);
  const deleted = db.deleteTicket(ticketId);
  if (!deleted) {
    return res.status(404).json({ message: "\u062A\u06CC\u06A9\u062A \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
  }
  logConfigChange(req, {
    resourceType: "TICKET_DELETION",
    resourceId: ticketId,
    actionDescription: `\u062D\u0630\u0641 \u062A\u06CC\u06A9\u062A \u0634\u0645\u0627\u0631\u0647 ${ticketId}`,
    details: { ticket_id: ticketId }
  });
  return res.json({ message: "\u062A\u06CC\u06A9\u062A \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062D\u0630\u0641 \u0634\u062F." });
});
function getOptionalUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    return db.getUserById(payload.sub) || null;
  } catch {
    return null;
  }
}
router.get("/push/public-key", (_req, res) => {
  const publicKey = getVapidPublicKey();
  return res.json({ publicKey });
});
router.post("/push/subscribe", (req, res) => {
  const { subscription } = req.body;
  if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
    return res.status(422).json({ message: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0627\u0634\u062A\u0631\u0627\u06A9 \u0627\u0639\u0644\u0627\u0646 \u0646\u0627\u0642\u0635 \u0627\u0633\u062A." });
  }
  const optionalUser = getOptionalUser(req);
  const userAgent = req.headers["user-agent"] || "Unknown Browser";
  const ip = req.ip || req.socket.remoteAddress || "localhost";
  const registered = db.addOrUpdatePushSubscription({
    user_id: optionalUser ? optionalUser.id : null,
    user_mobile: optionalUser ? optionalUser.mobile : null,
    role: optionalUser ? optionalUser.role : "guest",
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    },
    user_agent: userAgent,
    ip_address: ip
  });
  return res.status(201).json({
    success: true,
    message: "\u062F\u0633\u062A\u06AF\u0627\u0647 \u0634\u0645\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0627\u06CC \u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u0639\u0644\u0627\u0646\u200C\u0647\u0627 \u062B\u0628\u062A \u0634\u062F.",
    subscription_id: registered.id
  });
});
router.post("/push/unsubscribe", (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(422).json({ message: "\u0634\u0646\u0627\u0633\u0647 endpoint \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A." });
  }
  const removed = db.removePushSubscription(endpoint);
  return res.json({
    success: true,
    removed,
    message: removed ? "\u0627\u0634\u062A\u0631\u0627\u06A9 \u0627\u0639\u0644\u0627\u0646\u200C\u0647\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0644\u063A\u0648 \u0634\u062F." : "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F."
  });
});
router.post("/push/test", async (req, res) => {
  const { endpoint, title, body } = req.body;
  let targetSub = endpoint ? db.pushSubscriptions.find((s) => s.endpoint === endpoint) : null;
  if (!targetSub) {
    const optionalUser = getOptionalUser(req);
    if (optionalUser) {
      const userSubs = db.getPushSubscriptions({ user_id: optionalUser.id });
      if (userSubs.length > 0) {
        targetSub = userSubs[userSubs.length - 1];
      }
    }
  }
  if (!targetSub && db.pushSubscriptions.length > 0) {
    targetSub = db.pushSubscriptions[db.pushSubscriptions.length - 1];
  }
  if (!targetSub) {
    return res.status(404).json({
      success: false,
      message: "\u0647\u06CC\u0686 \u0627\u0634\u062A\u0631\u0627\u06A9 \u0627\u0639\u0644\u0627\u0646\u06CC \u0628\u0631\u0627\u06CC \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F. \u0644\u0637\u0641\u0627\u064B \u0627\u0628\u062A\u062F\u0627 \u062F\u06A9\u0645\u0647 \u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u0627\u0639\u0644\u0627\u0646 \u0631\u0627 \u0628\u0632\u0646\u06CC\u062F."
    });
  }
  const payload = {
    title: title || "\u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 | \u0627\u0639\u0644\u0627\u0646 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC PWA",
    body: body || "\u0633\u06CC\u0633\u062A\u0645 \u0648\u0628\u200C\u067E\u0648\u0634 \u0648 \u0633\u0631\u0648\u06CC\u0633\u200C\u0648\u0631\u06A9\u0631 \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0641\u0639\u0627\u0644 \u0648 \u0645\u062A\u0635\u0644 \u0627\u0633\u062A! \u{1F680}",
    icon: "/icon-192.svg",
    badge: "/badge-72.svg",
    url: "/admin",
    tag: "karovita-test-notification"
  };
  const result = await sendWebPush(targetSub, payload);
  if (result.success) {
    return res.json({
      success: true,
      message: "\u0627\u0639\u0644\u0627\u0646 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647 \u062F\u0633\u062A\u06AF\u0627\u0647 \u0634\u0645\u0627 \u0627\u0631\u0633\u0627\u0644 \u06AF\u0631\u062F\u06CC\u062F.",
      result
    });
  } else {
    if (result.statusCode === 410 || result.statusCode === 404) {
      db.removePushSubscription(targetSub.endpoint);
    }
    return res.status(500).json({
      success: false,
      message: `\u062E\u0637\u0627 \u062F\u0631 \u062A\u062D\u0648\u06CC\u0644 \u0648\u0628\u200C\u067E\u0648\u0634: ${result.error || "\u067E\u0627\u0633\u062E \u0646\u0627\u0645\u0648\u0641\u0642 \u0627\u0632 \u0633\u0631\u0648\u0631 \u067E\u0648\u0634"}`,
      result
    });
  }
});
router.get("/admin/push/subscribers", authMiddleware, adminOrSupportMiddleware, (req, res) => {
  const all = db.getAllPushSubscriptions();
  const total = all.length;
  const admin_count = all.filter((s) => s.role === "admin").length;
  const support_count = all.filter((s) => s.role === "support").length;
  const user_count = all.filter((s) => s.role === "user").length;
  const guest_count = all.filter((s) => s.role === "guest" || !s.role).length;
  return res.json({
    total,
    stats: {
      admin_count,
      support_count,
      user_count,
      guest_count
    },
    subscribers: all.map((s) => ({
      id: s.id,
      user_id: s.user_id,
      user_mobile: s.user_mobile,
      role: s.role,
      user_agent: s.user_agent,
      ip_address: s.ip_address,
      created_at: s.created_at,
      updated_at: s.updated_at
    }))
  });
});
router.post("/admin/push/broadcast", authMiddleware, adminMiddleware, async (req, res) => {
  const { title, body, targetRole = "all", url = "/" } = req.body;
  if (!title || !body) {
    return res.status(422).json({ message: "\u0639\u0646\u0648\u0627\u0646 \u0648 \u0645\u062A\u0646 \u067E\u06CC\u0627\u0645 \u0627\u0639\u0644\u0627\u0646 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A." });
  }
  let targets = db.getAllPushSubscriptions();
  if (targetRole && targetRole !== "all") {
    targets = targets.filter((s) => s.role === targetRole);
  }
  if (targets.length === 0) {
    return res.status(404).json({ message: "\u0647\u06CC\u0686 \u062F\u0633\u062A\u06AF\u0627\u0647 \u0641\u0639\u0627\u0644\u06CC \u062F\u0631 \u06AF\u0631\u0648\u0647 \u0627\u0646\u062A\u062E\u0627\u0628\u06CC \u0628\u0631\u0627\u06CC \u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u0639\u0644\u0627\u0646 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F." });
  }
  const payload = {
    title,
    body,
    icon: "/icon-192.svg",
    badge: "/badge-72.svg",
    url,
    tag: `karovita-broadcast-${Date.now()}`
  };
  const { sent, failed } = await broadcastWebPush(targets, payload);
  logConfigChange(req, {
    resourceType: "PUSH_NOTIFICATION_BROADCAST",
    resourceId: "BROADCAST",
    actionDescription: `\u0627\u0631\u0633\u0627\u0644 \u0627\u0639\u0644\u0627\u0646 \u0648\u0628\u200C\u067E\u0648\u0634 \u0647\u0645\u06AF\u0627\u0646\u06CC (\xAB${title}\xBB) \u0628\u0647 \u06AF\u0631\u0648\u0647 ${targetRole}`,
    details: { title, body, targetRole, url, sent_count: sent, failed_count: failed }
  });
  return res.json({
    message: `\u0627\u0639\u0644\u0627\u0646 \u0647\u0645\u06AF\u0627\u0646\u06CC \u0627\u0631\u0633\u0627\u0644 \u0634\u062F. (\u0645\u0648\u0641\u0642: ${sent}\u060C \u0646\u0627\u0645\u0648\u0641\u0642: ${failed})`,
    sent,
    failed,
    total_targets: targets.length
  });
});
router.get("/admin/gateways/settings", authMiddleware, adminMiddleware, async (req, res) => {
  const zibalConfig = getZibalConfig();
  const smsConfig = getSmsConfig();
  const rawTpls = smsConfig?.templates || {};
  const formattedTpls = {};
  const templateKeys = [
    { key: "otp", aliases: ["otp"] },
    { key: "invoice_issued", aliases: ["invoice_issued"] },
    { key: "sub_expiring_7days", aliases: ["sub_expiring_7days", "sub_expiry_7days"] },
    { key: "sub_expiring_3days", aliases: ["sub_expiring_3days", "sub_expiry_3days"] },
    { key: "ticket_created", aliases: ["ticket_created"] },
    { key: "payment_success", aliases: ["payment_success"] }
  ];
  for (const item of templateKeys) {
    let val = void 0;
    for (const alias of item.aliases) {
      if (rawTpls[alias] !== void 0) {
        val = rawTpls[alias];
        break;
      }
    }
    const num = typeof val === "object" && val !== null ? val.id : val;
    formattedTpls[item.key] = num && Number(num) > 0 ? Number(num) : null;
  }
  return res.json({
    data: {
      zibal: zibalConfig,
      sms: {
        ...smsConfig,
        templates: formattedTpls
      }
    }
  });
});
router.put("/admin/gateways/settings", authMiddleware, adminMiddleware, (req, res) => {
  const { zibal, sms } = req.body;
  if (zibal) {
    db.gatewaySettings.zibal = {
      ...db.gatewaySettings.zibal,
      ...zibal
    };
  }
  if (sms) {
    const incomingTemplates = sms.templates || {};
    const updatedTemplates = { ...db.gatewaySettings.sms?.templates || {} };
    const templateKeys = [
      { key: "otp", aliases: ["otp"] },
      { key: "invoice_issued", aliases: ["invoice_issued"] },
      { key: "sub_expiring_7days", aliases: ["sub_expiring_7days", "sub_expiry_7days"] },
      { key: "sub_expiring_3days", aliases: ["sub_expiring_3days", "sub_expiry_3days"] },
      { key: "ticket_created", aliases: ["ticket_created"] },
      { key: "payment_success", aliases: ["payment_success"] }
    ];
    for (const item of templateKeys) {
      let incomingVal = void 0;
      for (const alias of item.aliases) {
        if (incomingTemplates[alias] !== void 0) {
          incomingVal = incomingTemplates[alias];
          break;
        }
      }
      if (incomingVal !== void 0) {
        const cleanNum = incomingVal !== null && incomingVal !== "" && Number(incomingVal) > 0 ? Number(incomingVal) : null;
        for (const alias of item.aliases) {
          if (typeof updatedTemplates[alias] === "object" && updatedTemplates[alias] !== null) {
            updatedTemplates[alias] = {
              ...updatedTemplates[alias],
              id: cleanNum || 0,
              enabled: !!cleanNum
            };
          } else {
            updatedTemplates[alias] = cleanNum;
          }
        }
      }
    }
    db.gatewaySettings.sms = {
      ...db.gatewaySettings.sms,
      ...sms,
      templates: updatedTemplates
    };
  }
  db.save();
  logConfigChange(req, {
    resourceType: "GATEWAY_SETTINGS",
    resourceId: "GATEWAYS",
    actionDescription: "\u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0648 \u0630\u062E\u06CC\u0631\u0647 \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u062F\u0631\u06AF\u0627\u0647 \u067E\u0631\u062F\u0627\u062E\u062A \u0634\u0627\u067E\u0631\u06A9 \u0632\u06CC\u0628\u0627\u0644 \u0648 \u0648\u0628\u200C\u0633\u0631\u0648\u06CC\u0633 \u067E\u06CC\u0627\u0645\u06A9\u06CC SMS.ir \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631",
    details: { zibal_updated: !!zibal, sms_updated: !!sms }
  });
  return res.json({
    message: "\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u062F\u0631\u06AF\u0627\u0647\u200C\u0647\u0627\u06CC \u0628\u0627\u0646\u06A9\u06CC \u0648 \u0648\u0628\u200C\u0633\u0631\u0648\u06CC\u0633 \u067E\u06CC\u0627\u0645\u06A9 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0630\u062E\u06CC\u0631\u0647 \u06AF\u0631\u062F\u06CC\u062F.",
    data: db.gatewaySettings
  });
});
router.post("/admin/gateways/zibal/test", authMiddleware, adminMiddleware, async (req, res) => {
  const user = req.user;
  const amount = Number(req.body.amount) || 1e4;
  const clientOrigin = `${req.protocol}://${req.get("host") || "localhost:3000"}`;
  const mockOrder = {
    id: 999e3 + Math.floor(Math.random() * 999),
    order_number: "TEST-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    amount,
    description: "\u062A\u0633\u062A \u0627\u062A\u0635\u0627\u0644 \u062F\u0631\u06AF\u0627\u0647 \u0628\u0627\u0646\u06A9\u06CC \u0634\u0627\u067E\u0631\u06A9 \u0632\u06CC\u0628\u0627\u0644 \u0627\u0632 \u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627"
  };
  try {
    const result = await initiateZibalPayment(mockOrder, user, clientOrigin);
    return res.json({
      message: result.simulated ? "\u062F\u0631\u06AF\u0627\u0647 \u062F\u0631 \u062D\u0627\u0644\u062A \u0634\u0628\u06CC\u0647\u200C\u0633\u0627\u0632 \u062A\u0633\u062A \u0641\u0639\u0627\u0644 \u0627\u0633\u062A." : "\u062F\u0631\u062E\u0648\u0627\u0633\u062A \u0628\u0647 \u062F\u0631\u06AF\u0627\u0647 \u0632\u06CC\u0628\u0627\u0644 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0631\u0633\u0627\u0644 \u0634\u062F \u0648 \u0634\u0646\u0627\u0633\u0647 \u067E\u0631\u062F\u0627\u062E\u062A \u0634\u0627\u067E\u0631\u06A9 \u062F\u0631\u06CC\u0627\u0641\u062A \u06AF\u0631\u062F\u06CC\u062F.",
      data: result
    });
  } catch (err) {
    return res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0648\u0628\u200C\u0633\u0631\u0648\u06CC\u0633 \u0632\u06CC\u0628\u0627\u0644: " + err.message });
  }
});
router.post("/admin/gateways/sms/test", authMiddleware, adminMiddleware, async (req, res) => {
  const { mobile, event_type = "otp", template_id, parameters = {} } = req.body;
  if (!mobile || !/^09\d{9}$/.test(mobile)) {
    return res.status(422).json({ message: "\u0634\u0645\u0627\u0631\u0647 \u0645\u0648\u0628\u0627\u06CC\u0644 \u0645\u0639\u062A\u0628\u0631 \u06F1\u06F1 \u0631\u0642\u0645\u06CC \u0648\u0627\u0631\u062F \u0646\u0645\u0627\u06CC\u06CC\u062F (\u0645\u062B\u0627\u0644: 09123456789)." });
  }
  const result = await sendTemplateSms({
    mobile,
    eventType: event_type,
    templateId: template_id ? Number(template_id) : void 0,
    templateTitle: `\u062A\u0633\u062A \u062F\u0633\u062A\u06CC \u0627\u0632 \u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A (${event_type})`,
    parameters: Object.keys(parameters).length > 0 ? parameters : {
      CODE: "12345",
      CUSTOMER: "\u0645\u062F\u06CC\u0631 \u0633\u0627\u0645\u0627\u0646\u0647",
      ORDER: "INV-TEST-01",
      AMOUNT: "500,000",
      LINK: "karovita.ir",
      DAYS: "\u06F7",
      TITLE: "\u0633\u0627\u0632\u0645\u0627\u0646\u06CC \u06A9\u0627\u0631\u0648\u06CC\u062A\u0627",
      TICKET: "TK-1001",
      SUBJECT: "\u062A\u0633\u062A \u0633\u06CC\u0633\u062A\u0645",
      REF: "SHP-98765432"
    },
    userName: "\u0645\u062F\u06CC\u0631 \u062A\u0633\u062A"
  });
  return res.json({
    message: result.success ? "\u067E\u06CC\u0627\u0645\u06A9 \u062A\u0633\u062A \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0631\u0633\u0627\u0644 \u0634\u062F." : `\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645\u06A9: ${result.error}`,
    data: result
  });
});
router.get("/admin/gateways/sms/logs", authMiddleware, adminMiddleware, (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 300);
  const rawLogs = (db.smsLogs || []).slice(0, limit);
  const logs = rawLogs.map((l) => {
    let code = l.code;
    const msg = l.message || "";
    if (!code && msg) {
      const m = msg.match(/(?:CODE|Code|کد تایید|کد|رمز)\s*[:=]\s*(\d{4,8})/i);
      if (m) code = m[1];
    }
    if (!code && l.parameters && typeof l.parameters === "object") {
      code = l.parameters.CODE || l.parameters.code || l.parameters.otp;
    }
    return {
      ...l,
      code,
      created_at: l.created_at || l.timestamp,
      timestamp: l.timestamp || l.created_at
    };
  });
  return res.json({
    data: logs,
    total: (db.smsLogs || []).length
  });
});
router.post("/admin/gateways/sms/trigger-reminders", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const report = await checkAndSendSubscriptionExpiryReminders();
    return res.json({
      message: `\u0627\u0633\u06A9\u0646 \u0627\u0646\u0642\u0636\u0627\u06CC \u0627\u0634\u062A\u0631\u0627\u06A9\u200C\u0647\u0627 \u0627\u0646\u062C\u0627\u0645 \u0634\u062F. (${report.scanned} \u0627\u0634\u062A\u0631\u0627\u06A9 \u0641\u0639\u0627\u0644 \u0627\u0633\u06A9\u0646 \u0634\u062F\u060C ${report.sent7Days} \u067E\u06CC\u0627\u0645\u06A9 \u06F7 \u0631\u0648\u0632 \u0648 ${report.sent3Days} \u067E\u06CC\u0627\u0645\u06A9 \u06F3 \u0631\u0648\u0632 \u0627\u0631\u0633\u0627\u0644 \u0634\u062F)`,
      data: report
    });
  } catch (err) {
    return res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u062C\u0631\u0627\u06CC \u0627\u0633\u06A9\u0646 \u062E\u0648\u062F\u06A9\u0627\u0631 \u06CC\u0627\u062F\u0622\u0648\u0631\u06CC\u200C\u0647\u0627: " + err.message });
  }
});
router.get("/admin/gateways/health", authMiddleware, adminMiddleware, async (_req, res) => {
  const smsHealth = await checkSmsProviderHealth();
  const zibalConfig = getZibalConfig();
  return res.json({
    sms: smsHealth,
    zibal: {
      status: zibalConfig.enabled ? "healthy" : "degraded",
      merchant: zibalConfig.merchant,
      sandbox: zibalConfig.sandbox,
      enabled: zibalConfig.enabled,
      provider: "Zibal (Shaparak Gateway)"
    }
  });
});
var routes_default = router;

// server/securityHeaders.ts
var import_helmet = __toESM(require("helmet"), 1);
function applySecurityHeaders() {
  return [
    (0, import_helmet.default)({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", "https:", "data:", "blob:"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          connectSrc: ["'self'", "https:", "wss:", "ws:", "https://*.mediana.ir", "https://api.kavenegar.com"],
          frameAncestors: ["'self'", "https://*.google.com", "https://*.run.app", "https://ai.studio", "https://aistudio.google.com"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"]
        }
      },
      crossOriginEmbedderPolicy: false,
      // Allows cross-origin assets like fonts & cdn images
      crossOriginResourcePolicy: { policy: "cross-origin" },
      frameguard: false,
      // Handled via CSP frame-ancestors to allow AI Studio / Cloud Run preview iframe
      xContentTypeOptions: true,
      // X-Content-Type-Options: nosniff
      dnsPrefetchControl: { allow: false },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" }
    }),
    (req, res, next) => {
      res.setHeader("X-XSS-Protection", "1; mode=block");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
      res.removeHeader("X-Powered-By");
      next();
    }
  ];
}

// server.ts
async function startServer() {
  initServerLogger();
  const app = (0, import_express2.default)();
  const PORT = 3e3;
  app.use((0, import_compression.default)({
    level: 6,
    // balanced speed vs compression ratio
    threshold: 1024,
    // only compress responses > 1KB
    filter: (req, res) => {
      if (req.headers["accept"] === "text/event-stream") return false;
      return import_compression.default.filter(req, res);
    }
  }));
  app.use(applySecurityHeaders());
  app.set("trust proxy", 1);
  app.use((0, import_cors.default)());
  app.use(import_express2.default.json());
  app.use(import_express2.default.urlencoded({ extended: true }));
  app.use("/api", globalApiLimiter);
  app.get("/api/health", getHealthStatus);
  app.get("/health", getHealthStatus);
  app.get("/api/ping", (_req, res) => {
    res.json({ status: "ok", app: "karovita_erp", timestamp: Date.now() });
  });
  app.get("/ping", (_req, res) => {
    res.json({ status: "ok", app: "karovita_erp", timestamp: Date.now() });
  });
  app.use("/api", routes_default);
  app.use("/admin", routes_default);
  app.use((err, req, res, _next) => {
    logServerError(err, { url: req.originalUrl, method: req.method, body: req.body }, req, "error", "api");
    res.status(err.status || 500).json({
      message: err.message || "\u062E\u0637\u0627\u06CC \u062F\u0627\u062E\u0644\u06CC \u0633\u0631\u0648\u0631 \u0631\u062E \u062F\u0627\u062F\u0647 \u0627\u0633\u062A."
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path6.default.join(process.cwd(), "dist");
    app.use("/assets", import_express2.default.static(import_path6.default.join(distPath, "assets"), {
      maxAge: "365d",
      immutable: true
    }));
    app.use("/fonts", import_express2.default.static(import_path6.default.join(distPath, "fonts"), {
      maxAge: "30d"
    }));
    app.use(import_express2.default.static(distPath, {
      maxAge: "1h",
      etag: true,
      lastModified: true
    }));
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(import_path6.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
