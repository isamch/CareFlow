import { createHmac } from 'crypto';
import { hash, compare } from 'bcryptjs';


// hash for passwoard:
export const doHash = (value)=>{
  return hash(value, 12);
};

export const doHashValidation = (value, hashedValue) => {
	return compare(value, hashedValue);
};



// hmax for simple hash:
export const hmacHash = (value) => {
	return createHmac('sha256', process.env.HMAC_VERIFICATION_CODE_SECRET).update(value).digest('hex');
};