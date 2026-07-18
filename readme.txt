=== NetDraw ===
Contributors: aidamartinez
Tags: tennis, tournament, bracket, knockout, sports
Requires at least: 6.0
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A lightweight WordPress plugin for managing and displaying knockout tennis tournament brackets with a visual, interactive frontend.

== Description ==

NetDraw is a lightweight, spreadsheet-style WordPress plugin designed specifically for managing and displaying knockout tennis tournaments. Think of it as "TablePress, but built for brackets instead of standard tables."

It eliminates the need to use clunky third-party bracket websites or messy image uploads, keeping the entire tennis tournament experience native to your WordPress site.

**For Tournament Admins (Backend)**

* **Simple Setup**: Create a new tournament draw just like writing a standard post or page in WordPress.
* **Flexible Sizing**: Choose your tournament size (8, 16, 32, or 64 players) via a simple dropdown selection.
* **Easy Data Entry**: Dynamically generates a clean grid of input fields where you can type in player names for the first round and log scores as matches finish.
* **Automatic Progression**: Mark a player as the winner of a match and the plugin automatically pushes their name forward into the next round's slot.

**For Website Visitors (Frontend)**

* **Visual Brackets**: Generates a clean, classic, tree-style tournament bracket using a simple shortcode (e.g., `[netdraw id="123"]`).
* **Path Highlighting**: Hovering over any player highlights their entire journey across all rounds in real-time.
* **Responsive Design**: Uses a custom CSS tree-structure layout that enables smooth horizontal scrolling on mobile, tablet, and desktop.
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
6. As matches finish, fill in the score (e.g., `6-4 6-2`) and click the checkmark next to the winning player's name to automatically progress them.
7. Click **Publish** or **Update** to save.

= Displaying the Bracket =

Copy the shortcode from the tournament page or construct it manually:

`[netdraw id="YOUR_POST_ID"]`

Paste it into any WordPress Post, Page, or Widget area to display the visual bracket.

== Frequently Asked Questions ==

= What tournament formats are supported? =

NetDraw currently supports single-elimination (knockout) brackets with 8, 16, 32, or 64 players.

= Can I use this for sports other than tennis? =

Yes! While designed with tennis in mind, NetDraw works for any knockout-style tournament.

= Does NetDraw work on mobile? =

Yes. The frontend bracket uses horizontal scrolling and is fully functional on mobile and tablet devices.

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
