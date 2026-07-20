<?php
/**
 * Uninstall NetDraw.
 *
 * Runs only when the plugin is deleted via the WordPress admin.
 * Removes all tournament posts, their meta, and any plugin options.
 */

// Guard: only run in a real uninstall context.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Delete all posts of the 'netdraw' CPT (and their associated post meta).
$netdraw_posts = get_posts(
	array(
		'post_type'   => 'netdraw',
		'post_status' => 'any',
		'numberposts' => -1,
		'fields'      => 'ids',
	)
);

foreach ( $netdraw_posts as $post_id ) {
	wp_delete_post( $post_id, true ); // true = force delete, bypass trash.
}