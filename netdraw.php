<?php
/**
 * Plugin Name: NetDraw
 * Description: A lightweight, spreadsheet-style WordPress plugin for managing and displaying knockout tennis tournaments with visual brackets.
 * Version: 1.0.0
 * Author: Aida Martinez
 * Text Domain: netdraw
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
define( 'NETDRAW_VERSION', '1.0.0' );
define( 'NETDRAW_FILE', __FILE__ );
define( 'NETDRAW_DIR', plugin_dir_path( __FILE__ ) );
define( 'NETDRAW_URL', plugin_dir_url( __FILE__ ) );

// ---------------------------------------------------------------------------
// Lifecycle hooks – must be registered at top-level, not inside other hooks.
// ---------------------------------------------------------------------------
register_activation_hook( NETDRAW_FILE, 'netdraw_activate' );
register_deactivation_hook( NETDRAW_FILE, 'netdraw_deactivate' );

/**
 * Plugin activation: register CPT then flush rewrite rules.
 */
function netdraw_activate() {
	netdraw_register_cpt();
	flush_rewrite_rules();
}

/**
 * Plugin deactivation: flush rewrite rules so CPT routes are removed.
 */
function netdraw_deactivate() {
	flush_rewrite_rules();
}

/**
 * Register the Custom Post Type for NetDraw brackets.
 */
function netdraw_register_cpt() {
	$labels = array(
		'name'               => _x( 'Tournaments', 'post type general name', 'netdraw' ),
		'singular_name'      => _x( 'Tournament', 'post type singular name', 'netdraw' ),
		'menu_name'          => _x( 'NetDraw', 'admin menu', 'netdraw' ),
		'name_admin_bar'     => _x( 'Tournament', 'add new on admin bar', 'netdraw' ),
		'add_new'            => _x( 'Add New Tournament', 'tournament', 'netdraw' ),
		'add_new_item'       => __( 'Add New Tournament', 'netdraw' ),
		'new_item'           => __( 'New Tournament', 'netdraw' ),
		'edit_item'          => __( 'Edit Tournament', 'netdraw' ),
		'view_item'          => __( 'View Tournament', 'netdraw' ),
		'all_items'          => __( 'All Tournaments', 'netdraw' ),
		'search_items'       => __( 'Search Tournaments', 'netdraw' ),
		'parent_item_colon'  => __( 'Parent Tournaments:', 'netdraw' ),
		'not_found'          => __( 'No tournaments found.', 'netdraw' ),
		'not_found_in_trash' => __( 'No tournaments found in Trash.', 'netdraw' ),
	);

	$args = array(
		'labels'             => $labels,
		'public'             => false,
		'publicly_queryable' => false,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'query_var'          => false,
		'rewrite'            => false,
		'capability_type'    => 'post',
		'has_archive'        => false,
		'hierarchical'       => false,
		'menu_position'      => 30,
		'menu_icon'          => 'dashicons-grid-view',
		'supports'           => array( 'title' ),
	);

	register_post_type( 'netdraw', $args );
}
add_action( 'init', 'netdraw_register_cpt' );

/**
 * Enqueue scripts and styles for the admin editor.
 */
function netdraw_enqueue_admin_assets( $hook ) {
	// Only load on the post editor screens for this CPT.
	if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
		return;
	}

	global $post;
	if ( ! $post || 'netdraw' !== $post->post_type ) {
		return;
	}

	wp_enqueue_style( 'netdraw-admin-style', NETDRAW_URL . 'assets/css/admin.css', array(), NETDRAW_VERSION );
	wp_enqueue_script( 'netdraw-admin-script', NETDRAW_URL . 'assets/js/admin.js', array(), NETDRAW_VERSION, true );

	// Fetch existing bracket data to pass to JS.
	$bracket_data = get_post_meta( $post->ID, '_netdraw_bracket_data', true );
	if ( empty( $bracket_data ) ) {
		$bracket_data = wp_json_encode(
			array(
				'size'    => 8,
				'matches' => new stdClass(),
			)
		);
	}

	wp_localize_script(
		'netdraw-admin-script',
		'netdrawAdminData',
		array(
			'bracketData'    => json_decode( $bracket_data ),
			'frontendCssUrl' => NETDRAW_URL . 'assets/css/frontend.css',
		)
	);
}
add_action( 'admin_enqueue_scripts', 'netdraw_enqueue_admin_assets' );

/**
 * Enqueue scripts and styles for the frontend.
 */
function netdraw_enqueue_frontend_assets() {
	wp_register_style( 'netdraw-frontend-style', NETDRAW_URL . 'assets/css/frontend.css', array(), NETDRAW_VERSION );
	wp_register_script( 'netdraw-frontend-script', NETDRAW_URL . 'assets/js/frontend.js', array(), NETDRAW_VERSION, true );
}
add_action( 'wp_enqueue_scripts', 'netdraw_enqueue_frontend_assets' );

/**
 * Add Meta Box for NetDraw Tournament Settings & Editor.
 */
function netdraw_add_meta_box() {
	add_meta_box(
		'netdraw_editor_meta_box',
		__( 'Tournament Bracket Editor', 'netdraw' ),
		'netdraw_editor_meta_box_callback',
		'netdraw',
		'normal',
		'high'
	);
}
add_action( 'add_meta_boxes', 'netdraw_add_meta_box' );

/**
 * Meta Box Callback to render the editor container.
 */
function netdraw_editor_meta_box_callback( $post ) {
	// Add nonce for verification
	wp_nonce_field( 'netdraw_save_bracket', 'netdraw_nonce' );

	$bracket_data_json = get_post_meta( $post->ID, '_netdraw_bracket_data', true );
	$bracket_data = json_decode( $bracket_data_json, true );
	$size = isset( $bracket_data['size'] ) ? intval( $bracket_data['size'] ) : 8;
	?>
	<div class="netdraw-admin-wrapper">
		<div class="netdraw-admin-header" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
			<div class="netdraw-size-selector-wrap" style="display: flex; align-items: center; gap: 10px;">
				<label for="netdraw_bracket_size"><strong><?php esc_html_e( 'Tournament Size:', 'netdraw' ); ?></strong></label>
				<select id="netdraw_bracket_size" name="netdraw_bracket_size" class="postbox" style="margin: 0;">
					<option value="8" <?php selected( $size, 8 ); ?>>8 Players</option>
					<option value="16" <?php selected( $size, 16 ); ?>>16 Players</option>
					<option value="32" <?php selected( $size, 32 ); ?>>32 Players</option>
					<option value="64" <?php selected( $size, 64 ); ?>>64 Players</option>
				</select>
				<p class="description" style="margin: 0;"><?php esc_html_e( 'Changing the size will reset matches if they exceed the new size bounds.', 'netdraw' ); ?></p>
			</div>

			<div class="netdraw-shortcode-display" style="display: flex; align-items: center; gap: 8px;">
				<label><strong><?php esc_html_e( 'Shortcode:', 'netdraw' ); ?></strong></label>
				<input type="text" readonly value="<?php echo esc_attr( '[netdraw id="' . $post->ID . '"]' ); ?>" style="width: 150px; font-family: monospace; text-align: center; background: #f0f0f1; border: 1px solid #8c8f94; border-radius: 4px; padding: 4px;" onclick="this.select();">
				<button type="button" class="button button-secondary" onclick="navigator.clipboard.writeText('[netdraw id=\'<?php echo absint( $post->ID ); ?>\']'); alert('Shortcode copied to clipboard!');"><?php esc_html_e( 'Copy', 'netdraw' ); ?></button>
				<button type="button" class="button button-primary" id="netdraw_print_pdf" style="margin-left: 5px;"><?php esc_html_e( 'Print / PDF', 'netdraw' ); ?></button>
			</div>
		</div>

		<!-- Hidden input to store serialized bracket data JSON -->
		<input type="hidden" id="netdraw_bracket_data_input" name="netdraw_bracket_data" value="<?php echo esc_attr( $bracket_data_json ); ?>">

		<!-- Editor Grid Container -->
		<div id="netdraw_admin_grid_container" class="netdraw-admin-grid-container">
			<!-- Populated via Javascript -->
		</div>
	</div>
	<?php
}

/**
 * Save bracket data on post save.
 */
function netdraw_save_post_handler( $post_id ) {
	// Check if nonce is set.
	if ( ! isset( $_POST['netdraw_nonce'] ) ) {
		return;
	}

	// Verify nonce.
	if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['netdraw_nonce'] ) ), 'netdraw_save_bracket' ) ) {
		return;
	}

	// Check autosave.
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	// Check permissions.
	if ( isset( $_POST['post_type'] ) && 'netdraw' === $_POST['post_type'] ) {
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
	} else {
		return;
	}

	// Sanitize input: decode JSON first, then sanitize individual fields.
	// Do NOT run sanitize_textarea_field on raw JSON – it strips backslashes
	// that are required for valid JSON encoding.
	if ( isset( $_POST['netdraw_bracket_data'] ) ) {
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitized field-by-field after decoding below.
		$raw_json     = wp_unslash( $_POST['netdraw_bracket_data'] );
		$data_decoded = json_decode( $raw_json, true );

		if ( is_array( $data_decoded ) ) {
			$sanitized_matches = array();
			$size              = isset( $data_decoded['size'] ) ? intval( $data_decoded['size'] ) : 8;

			if ( isset( $data_decoded['matches'] ) && is_array( $data_decoded['matches'] ) ) {
				foreach ( $data_decoded['matches'] as $match_id => $match ) {
					$safe_match_id                         = sanitize_key( $match_id );
					$sanitized_matches[ $safe_match_id ] = array(
						'p1'       => isset( $match['p1'] ) ? sanitize_text_field( $match['p1'] ) : '',
						'p2'       => isset( $match['p2'] ) ? sanitize_text_field( $match['p2'] ) : '',
						'score'    => isset( $match['score'] ) ? sanitize_text_field( $match['score'] ) : '',
						'winner'   => isset( $match['winner'] ) ? sanitize_key( $match['winner'] ) : '',
						'datetime' => isset( $match['datetime'] ) ? sanitize_text_field( $match['datetime'] ) : '',
					);
				}
			}

			$sanitized_payload = array(
				'size'    => $size,
				'matches' => $sanitized_matches,
			);

			// update_post_meta handles slashing internally; do not wrap with wp_slash().
			update_post_meta( $post_id, '_netdraw_bracket_data', wp_json_encode( $sanitized_payload ) );
		}
	}
}
add_action( 'save_post_netdraw', 'netdraw_save_post_handler' );

/**
 * Shortcode to display a tournament bracket: [netdraw id="123"]
 */
function netdraw_shortcode_renderer( $atts ) {
	$args = shortcode_atts( array(
		'id' => 0,
	), $atts, 'netdraw' );

	$post_id = intval( $args['id'] );
	if ( ! $post_id || get_post_type( $post_id ) !== 'netdraw' ) {
		return '<div class="netdraw-error">' . esc_html__( 'Tournament bracket not found.', 'netdraw' ) . '</div>';
	}

	$bracket_data_json = get_post_meta( $post_id, '_netdraw_bracket_data', true );
	if ( empty( $bracket_data_json ) ) {
		return '<div class="netdraw-error">' . esc_html__( 'No data available for this tournament.', 'netdraw' ) . '</div>';
	}

	// Enqueue registered frontend assets
	wp_enqueue_style( 'netdraw-frontend-style' );
	wp_enqueue_script( 'netdraw-frontend-script' );

	// Output HTML container with the JSON data directly in data attribute (no inline scripts)
	ob_start();
	?>
	<div class="netdraw-bracket-container" data-bracket="<?php echo esc_attr( $bracket_data_json ); ?>">
		<!-- Loader / Placeholder -->
		<div class="netdraw-loader"><?php esc_html_e( 'Loading Tournament Draw...', 'netdraw' ); ?></div>
	</div>
	<?php
	return ob_get_clean();
}
add_shortcode( 'netdraw', 'netdraw_shortcode_renderer' );
