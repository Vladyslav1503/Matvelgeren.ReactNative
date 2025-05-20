import{ Redirect } from 'expo-router'
import { useState, useEffect } from 'react'
import { Session } from "@supabase/supabase-js";
import {supabase} from "@/lib/supabase";

export default function Index() {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })
    }, [])

    if (!session) {
        return <Redirect href={"/signIn"}/>
    }
    return <Redirect href={"/barCodeScanner"}/>
}
