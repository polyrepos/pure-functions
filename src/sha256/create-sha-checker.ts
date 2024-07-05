import { sha256 } from "./sha256";

function insertStringWithoutChangingLength(
	originalString: string,
	insertString: string,
	position: number,
) {
	const part1 = originalString.slice(0, position);
	const part2 = originalString.slice(position + insertString.length);
	return part1 + insertString + part2;
}

const sha256salt = {
	hash: (ascii: string, lastSalt: string) => {
		const salt =
			lastSalt || Math.random().toString(36).substring(2).slice(0, 8);

		const hash = sha256(salt.slice(3, 6) + ascii + salt);
		return insertStringWithoutChangingLength(hash, salt, 14);
	},

	verify: (ascii: string, verify: string) => {
		if (!verify) {
			return false;
		}
		const salt = verify.slice(14, 14 + 8);
		const hash = sha256salt.hash(ascii, salt);
		return hash === verify;
	},
};

export const createShaChecker = (seed: string) => {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const hash = (data: any) => {
		const v = typeof data === "string" ? data : JSON.stringify({ v: data });
		return sha256salt.hash(v + seed, "");
	};

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const verify = (data: any, verifyHash: string) => {
		const v = typeof data === "string" ? data : JSON.stringify({ v: data });
		const ascii = v + seed;
		if (!sha256salt.verify(ascii, verifyHash)) {
			console.error("data verification failed");
			return false;
		}
		return true;
	};
	return { verify, hash };
};
