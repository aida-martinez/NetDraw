=== NetDraw ===
Contributors: aida-martinez
Tags: tennis, tournament, bracket, knockout, sports
Requires at least: 6.0
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A lightweight WordPress plugin for managing and displaying knockout tennis tournament brackets with a visual, interactive frontend.

== Description ==

NetDraw is a lightweight, spreadsheet-style WordPress plugin designed specifically for managing and displaying knockout tennis tournaments. Think of it as "TablePress, but built for brackets instead of standard tables."

It eliminates the need to use clunky third-party bracket websites or messy image uploads, keeping the entire tennis tournament experience native to your WordPress site.

**For Tournament Admins (Backend)**

* **Simple Setup**: Create a new tournament draw just like writing a standard post or page in WordPress.
* **Flexible Sizing**: Choose your tournament size (8, 16, 32, or 64 players) via a simple dropdown selection.
* **Easy Data Entry**: Dynamically generates a clean grid of input fields where you can type in player names for the first round and log scores as matches finish.
* **Automatic Progression**: Mark a player as the winner of a match and the plugin automatically pushes their name forward into the next round's slot — saving you from manual re-typing.

**For Website Visitors (Frontend)**

* **Visual Brackets**: Generates a clean, classic, tree-style tournament bracket on any page or post using a simple shortcode (e.g., `[netdraw id="123"]`).
* **Path Highlighting**: Hovering over any player highlights their entire journey (matches won, played, and progressed) across all rounds in real-time.
* **Responsive Design**: Uses a custom CSS tree-structure layout that enables smooth horizontal scrolling on mobile, tablet, and desktop screens without breaking the visual integrity.
* **No Bloat**: Built purely using Vanilla JS and native CSS — no jQuery or external visual dependencies.

== Installation ==

1. Download the `netdraw.zip` file from the plugin page.
2. In your WordPress Admin Panel, navigate to **Plugins** > **Add New Plugin**.
3. Click on **Upload Plugin** at the top.
4. Select the `netdraw.zip` file and click **Install Now**.
5. Once installed, click **Activate Plugin**.

== Usage ==

= Creating a Tournament =

1. Navigate to the **NetDraw** section in your WordPress Admin sidebar.
2. Click **Add New Tournament**.
3. Enter a title for your tournament (e.g., *Summer Club Open 2026*).
4. Under the **Tournament Bracket Editor** meta box, choose the tournament size (8, 16, 32, or 64 players).
5. Fill in the player names for **Round 1**.
6. As matches finish, fill in the score (e.g., `6-4 6-2`) and click the checkmark next to the winning player's name to automatically progress them to the next round.
7. Click **Publish** or **Update** to save.

= Displaying the Bracket =

Copy the shortcode shown in the Tournament Bracket Editor, or construct it manually using the Post ID:

`[netdraw id="YOUR_POST_ID"]`

Paste it into any WordPress Post, Page, or Widget area to display the visual bracket.

== Frequently Asked Questions ==

= What tournament formats are supported? =

NetDraw currently supports single-elimination (knockout) brackets with 8, 16, 32, or 64 players.

= Can I use this for sports other than tennis? =

Yes! While designed with tennis in mind, NetDraw works for any knockout-style tournament.

= Does NetDraw work on mobile? =

Yes. The frontend bracket uses horizontal scrolling and is fully functional on mobile and tablet devices.

= Where is tournament data stored? =

All tournament data is stored in your WordPress database as post meta attached to the tournament post. No data is sent to any external service.

= What happens to my data if I uninstall the plugin? =

When you delete the plugin via the WordPress admin, all tournament posts and their associated data are permanently removed from your database.

== Screenshots ==

1. The admin bracket editor — enter player names and log scores round by round.
2. The frontend visual bracket — a responsive, tree-style knockout draw with path highlighting.

== Data and Privacy ==

NetDraw does not collect, store, or transmit any personal data to external services. All tournament data (player names, scores, results) is stored exclusively in your own WordPress database as post meta. No cookies are set by this plugin on the frontend.

== Developer Notes ==

= Data Schema =

The plugin stores tournament configuration and match data in a flat, index-based JSON object inside the `_netdraw_bracket_data` post meta field:

    {
      "size": 8,
      "matches": {
        "r1_m1": { "p1": "Federer", "p2": "Nadal", "score": "6-4 6-2", "winner": "p1" },
        "r1_m2": { "p1": "Djokovic", "p2": "Murray", "score": "7-5 6-3", "winner": "p1" },
        "r2_m1": { "p1": "Federer", "p2": "Djokovic", "score": "", "winner": "" }
      }
    }

= Dynamic Progression Logic =

To map match results forward, NetDraw uses simple binary propagation:

* The next match index = ceiling( m / 2 ), where m is the current match number within the round.
* If m is odd, the winner becomes Player 1 (p1) of the next match.
* If m is even, the winner becomes Player 2 (p2) of the next match.
* Subsequent rounds are set to read-only in the admin panel to prevent data out-of-sync issues.

== Changelog ==

= 1.0.0 =
* Initial release.
* Custom Post Type for tournaments.
* Admin bracket editor with dynamic grid and automatic progression.
* Frontend visual bracket with path highlighting via shortcode.
* Responsive CSS tree layout with no external dependencies.

== Upgrade Notice ==

= 1.0.0 =
Initial release.
