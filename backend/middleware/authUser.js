import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    let token;
    
    // Check for token in various possible locations
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Bearer Token format
        token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.token) {
        // Direct token in headers
        token = req.headers.token;
    }
    
    if (!token) {
        return res.json({ success: false, message: 'Not Authorized: Login Again' })
    }
    
    try {
        // For debugging: Try with the hardcoded secret
        const token_decode = jwt.verify(token, 'qwerty123');
        
        // If verification succeeds, set the user ID and continue
        req.body.userId = token_decode.id;
        next();
    } catch (error) {
        console.log('JWT verification error:', error.message);
        res.json({ success: false, message: error.message })
    }
}

export default authUser;