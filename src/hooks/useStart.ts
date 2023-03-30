import { useEffect, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

//@ts-ignore
import zxcvbn from 'zxcvbn';


/**
 * @param {Function} handleOkClick 确定按钮事件
 */
export default function useStart(handleOkClick: Function) {

    const [state, setPassword] = useState({
        password: '', score: 0
    })

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        const score = password ? zxcvbn(password).score : 0;
        setPassword({ password, score })
    }

    const enterAction = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.code === 'Enter' || e.code === 'NumpadEnter') {
            e.preventDefault();
            handleOkClick()
        }
    };

    useEffect(() => {
        // @ts-ignore   
        document.addEventListener("keydown", enterAction, true);

        return () => {       // @ts-ignore   
            document.removeEventListener("keydown", enterAction, true);
        };
    }, []);

    return {
        ...state,
        handlePasswordChange
    }
}