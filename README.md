# ✈️ Travel Agent AI: Autonomous Expedition Architect

**Travel Agent AI** is a state-of-the-art, autonomous travel planning application powered by Google's Gemini 3 Pro. It goes beyond simple prompt-response by implementing a multi-step agentic workflow to research, architect, validate, and optimize travel itineraries based on precise fiscal constraints and user preferences.

![App Status](https://img.shields.io/badge/Status-Operational-success?style=for-the-badge)
![AI Model](https://img.shields.io/badge/Neural_Core-Gemini_3_Pro-blueviolet?style=for-the-badge)
![Framework](https://img.shields.io/badge/Framework-React_19-blue?style=for-the-badge)

---

## 🚀 Key Features

- **Autonomous Agent Console**: Watch the AI "think" in real-time through a simulated neural feed as it researches and validates your trip.
- **Fiscal Boundary Protocol**: Automatically adjusts itinerary items to ensure the total cost (Activities + Accommodation) never exceeds your specified budget.
- **Dynamic Optimization**: Intelligent sequencing of activities based on geographical location to minimize travel time.
- **Visual Analytics**: Interactive budget utilization gauges and resource allocation bar charts using Recharts.
- **Adaptive UI**: High-end "Space" aesthetic with seamless Dark/Light mode transitions and glass-morphism effects.
- **Manifest Export**: Generate and download a structured `.txt` expedition manifest for offline use.

---

## 🛠 Technical Architecture

- **Frontend**: React 19 (ES6 Modules)
- **Styling**: Tailwind CSS with custom Design Tokens
- **AI Engine**: `@google/genai` (utilizing `gemini-3-pro-preview`)
- **Icons**: Lucide React
- **Data Viz**: Recharts (Pie & Bar modules)
- **Deployment**: Vite-ready structure

---

## 🤖 The Agent Workflow

The "Expedition Protocol" follows five distinct phases:

1.  **Geo-Signal Scan (Research)**: Identifying regional nodes and verifying location availability.
2.  **Initial Synthesis (Drafting)**: Constructing the first-pass itinerary based on user preference signatures.
3.  **Fiscal Validation**: Cross-referencing the total projected "burn" against the user-defined capital limit.
4.  **Vector Optimization**: Re-shuffling activities to create a logical geographic flow and swapping high-cost items if budget limits are breached.
5.  **Final Rendering**: Producing the visual manifest and analytical data visualizations.

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+)
- A Google Gemini API Key (obtained from [Google AI Studio](https://aistudio.google.com/))

### Installation

1.  **Clone the repository** (conceptually):
    ```bash
    git clone https://github.com/your-repo/travel-agent-ai.git
    cd travel-agent-ai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory and add your API key:
    ```env
    API_KEY=your_gemini_api_key_here
    ```

4.  **Launch Interface**:
    ```bash
    npm run dev
    ```

---

## 📁 Project Structure

```text
├── components/
│   ├── ActivityDetailPanel.tsx  # Slide-out deep-dive for activities
│   ├── AgentLogConsole.tsx      # The "Neural Feed" log terminal
│   ├── BudgetGauge.tsx          # Recharts-powered efficiency gauge
│   ├── ItineraryCard.tsx        # Accordion-style daily phase view
├── services/
│   └── geminiService.ts         # Logic for AI agent prompts and schemas
├── types.ts                     # Core TypeScript interfaces
├── App.tsx                      # Main application orchestrator
└── index.css                    # Design tokens and global animations
```

---

## 🛡 License

This project is architected for exploration. Distributed under the MIT License.

---

**Built with ⚡ by the Autonomous Architecture Department.**
