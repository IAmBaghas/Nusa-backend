const pool = require('../config/database');

const getNotifications = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                n.*,
                sender.full_name as sender_name,
                sender.id as sender_id,
                sender.profile_image as sender_profile_image
            FROM notifications n
            JOIN profile sender ON n.sender_id = sender.id
            WHERE n.recipient_id = $1 AND n.status = true
            ORDER BY n.created_at DESC
        `, [req.user.id]);

        const processedNotifications = result.rows.map(notification => ({
            ...notification,
            sender_profile_image: notification.sender_profile_image 
                ? notification.sender_profile_image.replace(/^.*[\/\\]/, '')
                : null
        }));

        res.json({
            success: true,
            data: processedNotifications
        });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting notifications'
        });
    } finally {
        client.release();
    }
};

const createNotification = async (req, res) => {
    const client = await pool.connect();
    try {
        const { post_id, type, content } = req.body;
        const sender_id = req.user.id;

        // Get post owner's ID
        const postResult = await client.query(
            'SELECT profile_id FROM siswa_posts WHERE id = $1',
            [post_id]
        );

        if (postResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const recipient_id = postResult.rows[0].profile_id;

        // Don't create notification if sender is the recipient
        if (sender_id === recipient_id) {
            return res.status(201).json({
                success: true,
                message: 'Self notification skipped'
            });
        }

        const result = await client.query(`
            INSERT INTO notifications 
            (recipient_id, sender_id, post_id, type, content)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [recipient_id, sender_id, post_id, type, content]);

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating notification'
        });
    } finally {
        client.release();
    }
};

const markAsRead = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        
        await client.query(`
            UPDATE notifications 
            SET is_read = true
            WHERE id = $1 AND recipient_id = $2
        `, [id, req.user.id]);

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking notification as read'
        });
    } finally {
        client.release();
    }
};

const deleteNotification = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        
        await client.query(`
            UPDATE notifications 
            SET status = false
            WHERE id = $1 AND recipient_id = $2
        `, [id, req.user.id]);

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting notification'
        });
    } finally {
        client.release();
    }
};

module.exports = {
    getNotifications,
    createNotification,
    markAsRead,
    deleteNotification
}; 