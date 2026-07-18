# NetDraw

NetDraw is a lightweight, spreadsheet-style WordPress plugin designed specifically for managing and displaying knockout tennis tournaments. Think of it as "TablePress, but built for brackets instead of standard tables."

It eliminates the need to use clunky third-party bracket websites or messy image uploads, keeping the entire tennis tournament experience native to the club or league's WordPress site.

---

## Features

### For the Tournament Admin (The Backend)
* **Simple Setup**: Create a new tournament draw just like writing a standard post or page in WordPress.
* **Flexible Sizing**: Choose your tournament size ($8, 16, 32, \text{ or } 64$ players) via a simple dropdown selection.
* **Easy Data Entry**: Dynamically generates a clean grid of input fields where you can type in player names for the first round and log scores as matches finish.
* **Automatic Progression**: Mark a player as the winner of a match, and the plugin automatically pushes their name forward into the next round's slot—saving you from manual re-typing.

### For the Website Visitors (The Frontend)
* **Visual Brackets**: Generates a clean, classic, tree-style tournament bracket on any page or post using a simple shortcode (e.g., `[netdraw id="123"]`).
* **Premium Path Highlighting**: Hovering over any player highlights their entire journey (matches won, played, and progressed) across all rounds in real-time.
* **Responsive Design**: Uses a custom CSS tree-structure layout that enables smooth swiping and horizontal scrolling on mobile, tablet, and desktop screens without breaking the visual integrity.
* **No Bloat**: Built purely using Vanilla JS and native CSS without jQuery or external visual dependencies.

---

## File Structure

```
NetDraw/
├── netdraw.php                 # Main plugin entrypoint & WordPress hooks
├── project-plan.md             # Development roadmap
├── README.md                   # Plugin documentation
├── netdraw.zip                 # Packaged plugin ready for installation
└── assets/
    ├── css/
    │   ├── admin.css           # Custom styling for the backend meta box
    │   └── frontend.css        # Tree styling, lines & colors for the frontend
    └── js/
        ├── admin.js            # Admin grid creation & progression propagation
        └── frontend.js         # Frontend binary tree renderer & path highlighting
```

---

## Installation

1. Download the pre-packaged [netdraw.zip](file:///c:/Users/aida-/Code/NetDraw/netdraw.zip) file.
2. In your WordPress Admin Panel, navigate to **Plugins** $\rightarrow$ **Add New Plugin**.
3. Click on **Upload Plugin** at the top.
4. Select the `netdraw.zip` file and click **Install Now**.
5. Once installed, click **Activate Plugin**.

---

## Usage

### 1. Creating a Tournament
1. Navigate to the newly added **NetDraw** section in your WordPress Admin sidebar.
2. Click **Add New Tournament**.
3. Enter a Title for your tournament (e.g., *Summer Club Open 2026*).
4. Under the **Tournament Bracket Editor** meta box, choose the tournament size ($8, 16, 32, 64$ players).
5. Fill in the player names for **Round 1**.
6. As matches finish, fill in the score (e.g., `6-4 6-2`) and click the checkmark button next to the winning player's name to automatically progress them to the next round.
7. Click **Publish** or **Update** to save.

### 2. Displaying the Bracket
Copy the shortcode from the tournament page or construct it manually using the Post ID:
```text
[netdraw id="YOUR_POST_ID"]
```
Paste this shortcode into any WordPress Post, Page, or Widget area to display the visual bracket.

---

## Development Notes

### Data Schema
The plugin stores tournament configuration and matches in a flat, index-based JSON object inside the `_netdraw_bracket_data` post meta field.
```json
{
  "size": 8,
  "matches": {
    "r1_m1": { "p1": "Federer", "p2": "Nadal", "score": "6-4 6-2", "winner": "p1" },
    "r1_m2": { "p1": "Djokovic", "p2": "Murray", "score": "7-5 6-3", "winner": "p1" },
    "r2_m1": { "p1": "Federer", "p2": "Djokovic", "score": "", "winner": "" }
  }
}
```

### Dynamic Progression Formula
To map match results forward, NetDraw uses a simple binary propagation logic:
$$\text{Next Match} = \lceil m/2 \rceil$$
* If match number ($m$) is odd, the winner becomes `p1` (Player 1) of the next match.
* If match number ($m$) is even, the winner becomes `p2` (Player 2) of the next match.
* Subsequent rounds are marked as `readOnly` in the admin panel to prevent data out-of-sync issues, ensuring that the visual progression matches the actual results.
