# Enterprise Ticketing Portal

## 1. Core Objective

To create a centralized portal for all internal employees to manage their ticketing needs. This includes, but is not limited to, creating requests, tasks, and reporting incidents. The portal aims to provide a unified and streamlined experience, abstracting away the complexities of navigating multiple underlying ticketing systems.

## 2. Key Components

The portal will primarily feature two main components:

### 2.1. Link Finder

A robust search functionality that allows employees to quickly find information, relevant forms, or previous tickets across integrated systems. This will be a simple search bar that will return a list of links to the user.

### 2.2. AI Assistant

An intelligent assistant designed to help employees with their ticketing needs. This will be a chatbot that will be able to understand employee requests in natural language and guide them to the correct resources or ticketing system. It will also be able to assist in or automate the creation of tickets and offer guided troubleshooting or basic automated resolutions for common issues.

## 3. AI Assistant Functionality & Integration Strategy

The AI Assistant is central to the portal's utility, acting as an intelligent intermediary between the user and the various backend ticketing systems.

### 3.1. Goal

The primary goal of the AI Assistant is to understand the user's intent (e.g., "report a leak," "request a new laptop," "ask about benefits") and efficiently guide them through the process of resolving their query or creating the appropriate ticket in the correct system.

### 3.2. Primary System & Orchestration

While multiple ticketing systems are in use, ServiceNow will be the key integration point and the **central system of record for reporting**. It may serve as a primary system for initiating some tickets or as an orchestrator for interactions with other specialized ticketing systems (e.g., a facilities ticketing system).

When a user's need requires multiple underlying ticketing systems, the typical workflow will involve:

1. The AI Assistant guiding the user to initiate a master ticket in ServiceNow (or the most appropriate primary system if not ServiceNow for that specific case).
2. ServiceNow (or the primary system) then creating and managing child tickets in the necessary sub-ticketing systems.
3. These child tickets in sub-systems will be linked back to the master ServiceNow ticket using a unique identifier from the master ticket.
4. Status updates and relevant data from child tickets will be reported back to the master ServiceNow ticket, allowing for centralized tracking and reporting.

### 3.3. Integration Levels

The integration with external ticketing systems will be developed iteratively, progressing through the following levels:

- **Level 1: Link Generation**
  - **Description:** Based on the user's conversation, the AI Assistant identifies the appropriate external ticketing system and provides a direct link to it.
  - **Example:** If a user wants to report a building maintenance issue, the AI might provide a link to `https://facilities.example.com/report-incident`.
  - **Mechanism:** Simple URL redirection.

- **Level 2: Form Pre-fill via URL Parameters**
  - **Description:** The AI Assistant collects necessary information from the conversation with the user. It then constructs a URL with parameters that pre-fill relevant fields on the target ticketing system's form. The user is then redirected to this pre-filled form in a new tab.
  - **Example:** For a laptop request, the AI gathers details like department, justification, and preferred model, then opens `https://it-assets.example.com/new-request?type=laptop&department=X&justification=Y&model=Z`.
  - **Mechanism:** URL parameter construction and redirection.

- **Level 3: Direct Submission (Headless Interaction)**
  - **Description:** The AI Assistant collects all required information and submits the ticket directly to the external ticketing system via API calls, without the user needing to visit or interact with the external system's UI. The AI confirms submission success or failure to the user within the portal.
  - **Mechanism:** API integrations with the respective ticketing systems.

### 3.4. User Context Awareness

To enhance personalization and efficiency, the AI Assistant will strive to be aware of relevant user context, such as:

- User's name, title, and department/component.
- User's physical location (e.g., office building, floor), where relevant for specific requests (like facilities issues).

This information can be used to:

- Tailor conversations and suggestions.
- Pre-fill information in ticket forms more accurately (extending Level 2 integration).
- Route requests to the appropriate support groups or systems more effectively.
Access to this user data will be handled in accordance with privacy and security policies, potentially integrating with existing employee directory services.

### 3.5. Centralized Reporting Strategy

A key goal is to provide visibility into how well each integrated service/system reports its data back to the central ServiceNow instance. This will be tracked and potentially visualized using the following statuses:

- **No Integration:** The external system does not currently feed any data back into ServiceNow for centralized reporting. Manual data consolidation would be required.
- **Moderate Integration:** The external system provides some automated reporting back to ServiceNow, but it might be partial, delayed, or require some manual intervention to fully reconcile with the master ticket. For example, basic status updates are synced, but detailed logs or resolution steps are not.
- **Fully Integrated:** The external system seamlessly and automatically reports all relevant data (e.g., status changes, resolution details, associated CIs, user communications) back to the corresponding master ticket in ServiceNow in near real-time. This allows for comprehensive, accurate, and timely centralized reporting without manual effort.

The "Integration Progress" leaderboard will reflect these reporting integration statuses for each service.

## 4. Context & Challenges

This portal is being developed to address the fragmentation caused by numerous specialized ticketing systems within the organization. The key challenge will be the robust integration with these varied systems, each potentially having different APIs, authentication methods, and data schemas. Future documentation on specific system APIs will be crucial for advancing integration levels.

## 5. Project Structure Overview

Below is a general overview of the project's directory structure to help with navigation and understanding the codebase layout. Common build/tooling directories like `node_modules`, `.git`, `.astro`, etc., are omitted for clarity.

```plaintext
.
├── config/
│   ├── astro.config.mjs
│   ├── biome.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── public/
│   ├── favicons/
│   └── links.json
├── src/
│   ├── assets/
│   ├── components/
│   ├── images/
│   ├── layouts/
│   ├── pages/
│   └── styles/
```

## 6. Deployment & Hosting (Netlify)

The project is configured for deployment on Netlify.

### 6.1. Configuration (`netlify.toml`)

A `netlify.toml` file is present to define build commands, the functions directory (`netlify/functions`), and potentially other Netlify-specific settings like redirects, headers, or environment variable contexts.

### 6.2. Environment Variables

Environment variables are managed through Netlify's UI. The following variables are currently set:

- `GEMINI_API_KEY`: API key for Google Gemini AI

### 6.3. Build & Deploy

The build process is handled by Netlify's CLI. The `build` script in `package.json` is configured to run the build process.



## 7. Technology Stack

The project leverages a modern web development stack:

- **Framework:** Astro
- **Language:** TypeScript
- **Styling:** Tailwind CSS (version 4.0, no configuration file)
- **Testing:** Vitest
- **Linting/Formatting:** Biome
- **Deployment:** Netlify
- **Package Manager:** npm
- **HTTP Client:** Native Fetch API
