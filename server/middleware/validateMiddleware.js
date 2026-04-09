import logger from '../utils/logger.js';

const validateRequest = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (e) {
        logger.warn(`Invalid request data for ${req.originalUrl}: ${JSON.stringify(e.errors)}`);
        return res.status(400).json({
            message: 'Validation failed',
            errors: e.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message
            }))
        });
    }
};

export default validateRequest;
