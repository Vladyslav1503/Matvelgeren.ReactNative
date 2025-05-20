import { Redirect } from 'expo-router';
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Subscribe to session changes
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        // Cleanup listener on unmount
        return () => {
            authListener.subscription?.unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!session) {
        return <Redirect href="/signIn" />;
    }

    return <Redirect href="/barCodeScanner" />;
}
