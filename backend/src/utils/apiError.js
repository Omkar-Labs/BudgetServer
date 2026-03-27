class ApiError extends Error {
    constructor(
        statusCode, 
        message = "Something went wrong",
        error = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.error = error;
        this.message = message;
        this.success = false;

        if (stack) {
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor);    
        }
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
            error: this.error,
            stack: this.stack,
            success: this.success
        }
    }
}

export default ApiError;