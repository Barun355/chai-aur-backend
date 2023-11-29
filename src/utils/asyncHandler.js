
const asyncHandlerPromise = (handler) => {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(err => next(err))
    }
}


const asyncHandlerTryCatch = (func) => async (req, res, next) => {
    try {
        return await func(req, res, next)
    } catch (error) {
        req.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}


export { asyncHandlerPromise, asyncHandlerTryCatch }