
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    Pressable,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {supabase} from "@/lib/supabase";

// Import SVG icons
// Note: You'll need to create/import these SVG files in your assets/icons folder
import SettingsIcon from '../../assets/icons/settings.svg';
import PencilIcon from '../../assets/icons/pencil.svg';
import PlusIcon from '../../assets/icons/plus.svg';
import Avatar from '../../assets/icons/avatar.svg';

// Define types for our data structures
type User = {
    name: string;
    email: string;
    dob: string;
    phone: string;
    [key: string]: string; // Index signature to allow dynamic field access
};

type Restriction = {
    id: number;
    name: string;
    active: boolean;
};

type NutritionType = 'fat' | 'calories' | 'protein' | 'carbs';

export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState<User>({
        name: "Ola Normann",
        email: "Ola_Normann@mail.no",
        dob: "01/01/1969",
        phone: "+47 12345678"
    });

    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<keyof User | null>(null);
    const [tempValue, setTempValue] = useState<string>("");

    // Nutritional values
    const [fat, setFat] = useState<string>("83g");
    const [calories, setCalories] = useState<string>("2500kcal");
    const [protein, setProtein] = useState<string>("125g");
    const [carbs, setCarbs] = useState<string>("83g");
    const [editNutrition, setEditNutrition] = useState<NutritionType | null>(null);
    const [tempNutrition, setTempNutrition] = useState<string>("");

    // Dietary restrictions
    const [activeRestrictions, setActiveRestrictions] = useState<Restriction[]>([
        { id: 1, name: "Unhealthy", active: true },
        { id: 2, name: "Gluten", active: true },
        { id: 3, name: "Vegan", active: true },
    ]);

    // Available restrictions to add
    const [availableRestrictions, setAvailableRestrictions] = useState<Restriction[]>([
        { id: 4, name: "Lactose", active: false },
        { id: 5, name: "Nuts", active: false },
        { id: 6, name: "Ultra-Processed", active: false },
        { id: 7, name: "Vegetarian", active: false },
        { id: 8, name: "Vegan", active: false },
        { id: 9, name: "Pescatarian", active: false },
        { id: 10, name: "No Sugar", active: false },
        { id: 11, name: "Low Carb", active: false },
    ]);

    const handleSignOut = (): void => {
        // Mock sign out - will be replaced with real functionality later
        Alert.alert("Sign Out", "User signed out successfully");
        supabase.auth.signOut();
        router.replace("/");
        setShowSettings(false);
    };

    const handleDeleteProfile = (): void => {
        Alert.alert(
            "Delete Profile",
            "Are you sure you want to delete your profile? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        // Mock delete - will be replaced with real functionality later
                        Alert.alert("Profile Deleted", "Your profile has been deleted");
                        router.replace("/signIn");
                    }
                }
            ]
        );

        setShowSettings(false);
    };

    const handleEditField = (field: keyof User, value: string): void => {
        setEditMode(field);
        setTempValue(value);
    };

    const saveEditField = (field: keyof User): void => {
        // Update user data locally for now
        const newUser = { ...user };
        newUser[field] = tempValue;
        setUser(newUser);
        setEditMode(null);
    };

    const handleEditNutrition = (type: NutritionType, value: string): void => {
        setEditNutrition(type);
        setTempNutrition(value);
    };

    const saveNutrition = (type: NutritionType): void => {
        switch (type) {
            case 'fat':
                setFat(tempNutrition);
                break;
            case 'calories':
                setCalories(tempNutrition);
                break;
            case 'protein':
                setProtein(tempNutrition);
                break;
            case 'carbs':
                setCarbs(tempNutrition);
                break;
            default:
                break;
        }
        setEditNutrition(null);
    };

    const toggleRestriction = (id: number): void => {
        // Find the restriction
        const found = activeRestrictions.find(r => r.id === id);

        if (found) {
            // Remove from active restrictions
            setActiveRestrictions(activeRestrictions.filter(r => r.id !== id));

            // Add to available restrictions
            setAvailableRestrictions([...availableRestrictions, {...found, active: false}]);
        }
    };

    const addRestriction = (id: number): void => {
        // Find the restriction
        const restriction = availableRestrictions.find(r => r.id === id);

        if (restriction) {
            // Add to active restrictions
            setActiveRestrictions([...activeRestrictions, { ...restriction, active: true }]);

            // Remove from available restrictions
            setAvailableRestrictions(availableRestrictions.filter(r => r.id !== id));
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            {/* Header with Settings icon */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => setShowSettings(!showSettings)}
                >
                    <SettingsIcon width={24} height={24} />
                </TouchableOpacity>
            </View>

            {/* Settings Drop Down */}
            {showSettings && (
                <Pressable
                    style={styles.overlay}
                    onPress={() => setShowSettings(false)}
                >
                    <View style={[styles.settingsMenu, Platform.OS === 'ios' && styles.iOSShadow]}>
                        <View style={styles.settingsHeader}>
                            <Text style={styles.settingsTitle}>Settings</Text>
                            <SettingsIcon width={20} height={20} />
                        </View>

                        <TouchableOpacity
                            style={styles.settingsItem}
                            onPress={handleSignOut}
                        >
                            <Text style={styles.settingsItemText}>Sign out</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.settingsItem}
                            onPress={handleDeleteProfile}
                        >
                            <Text style={styles.deleteProfileText}>Delete Profile</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            )}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileSection}>
                        <View style={styles.profileImageContainer}>
                            <View style={styles.profileImage}>
                                <Avatar width={80} height={80} stroke={"#547DA0"} />
                            </View>
                        </View>

                        <View style={styles.profileInfo}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Name:</Text>
                                {editMode === 'name' ? (
                                    <View style={styles.editContainer}>
                                        <TextInput
                                            style={styles.editInput}
                                            value={tempValue}
                                            onChangeText={setTempValue}
                                            autoFocus
                                        />
                                        <TouchableOpacity onPress={() => saveEditField('name')}>
                                            <Text style={styles.saveButton}>Save</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.valueContainer}>
                                        <Text style={styles.infoValue}>{user.name}</Text>
                                        <TouchableOpacity onPress={() => handleEditField('name', user.name)}>
                                            <PencilIcon width={16} height={16} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Email:</Text>
                                {editMode === 'email' ? (
                                    <View style={styles.editContainer}>
                                        <TextInput
                                            style={styles.editInput}
                                            value={tempValue}
                                            onChangeText={setTempValue}
                                            autoFocus
                                            keyboardType="email-address"
                                        />
                                        <TouchableOpacity onPress={() => saveEditField('email')}>
                                            <Text style={styles.saveButton}>Save</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.valueContainer}>
                                        <Text style={styles.infoValue}>{user.email}</Text>
                                        <TouchableOpacity onPress={() => handleEditField('email', user.email)}>
                                            <PencilIcon width={16} height={16} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>DOB:</Text>
                                {editMode === 'dob' ? (
                                    <View style={styles.editContainer}>
                                        <TextInput
                                            style={styles.editInput}
                                            value={tempValue}
                                            onChangeText={setTempValue}
                                            autoFocus
                                        />
                                        <TouchableOpacity onPress={() => saveEditField('dob')}>
                                            <Text style={styles.saveButton}>Save</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.valueContainer}>
                                        <Text style={styles.infoValue}>{user.dob}</Text>
                                        <TouchableOpacity onPress={() => handleEditField('dob', user.dob)}>
                                            <PencilIcon width={16} height={16} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Phone:</Text>
                                {editMode === 'phone' ? (
                                    <View style={styles.editContainer}>
                                        <TextInput
                                            style={styles.editInput}
                                            value={tempValue}
                                            onChangeText={setTempValue}
                                            autoFocus
                                            keyboardType="phone-pad"
                                        />
                                        <TouchableOpacity onPress={() => saveEditField('phone')}>
                                            <Text style={styles.saveButton}>Save</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.valueContainer}>
                                        <Text style={styles.infoValue}>{user.phone}</Text>
                                        <TouchableOpacity onPress={() => handleEditField('phone', user.phone)}>
                                            <PencilIcon width={16} height={16} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Dietary Restrictions Card */}
                <View style={styles.dietaryCard}>
                    <Text style={styles.cardTitle}>Your Daily Dietary Restrictions</Text>

                    <View style={styles.nutritionGrid}>
                        <View style={styles.nutritionRow}>
                            <View style={[styles.nutritionBox, styles.fatBox]}>
                                <Text style={styles.nutritionLabel}>Fat</Text>
                                <View style={styles.nutritionValueContainer}>
                                    {editNutrition === 'fat' ? (
                                        <View style={styles.editNutritionContainer}>
                                            <TextInput
                                                style={styles.editNutritionInput}
                                                value={tempNutrition}
                                                onChangeText={setTempNutrition}
                                                autoFocus
                                            />
                                            <TouchableOpacity onPress={() => saveNutrition('fat')}>
                                                <Text style={styles.saveButton}>Save</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <>
                                            <Text style={styles.nutritionValue}>{fat}</Text>
                                            <TouchableOpacity onPress={() => handleEditNutrition('fat', fat)}>
                                                <PencilIcon width={16} height={16} />
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </View>

                            <View style={[styles.nutritionBox, styles.caloriesBox]}>
                                <Text style={styles.nutritionLabel}>Calories</Text>
                                <View style={styles.nutritionValueContainer}>
                                    {editNutrition === 'calories' ? (
                                        <View style={styles.editNutritionContainer}>
                                            <TextInput
                                                style={styles.editNutritionInput}
                                                value={tempNutrition}
                                                onChangeText={setTempNutrition}
                                                autoFocus
                                            />
                                            <TouchableOpacity onPress={() => saveNutrition('calories')}>
                                                <Text style={styles.saveButton}>Save</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <>
                                            <Text style={styles.nutritionValue}>{calories}</Text>
                                            <TouchableOpacity onPress={() => handleEditNutrition('calories', calories)}>
                                                <PencilIcon width={16} height={16} />
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </View>
                        </View>

                        <View style={styles.nutritionRow}>
                            <View style={[styles.nutritionBox, styles.proteinBox]}>
                                <Text style={styles.nutritionLabel}>Protein</Text>
                                <View style={styles.nutritionValueContainer}>
                                    {editNutrition === 'protein' ? (
                                        <View style={styles.editNutritionContainer}>
                                            <TextInput
                                                style={styles.editNutritionInput}
                                                value={tempNutrition}
                                                onChangeText={setTempNutrition}
                                                autoFocus
                                            />
                                            <TouchableOpacity onPress={() => saveNutrition('protein')}>
                                                <Text style={styles.saveButton}>Save</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <>
                                            <Text style={styles.nutritionValue}>{protein}</Text>
                                            <TouchableOpacity onPress={() => handleEditNutrition('protein', protein)}>
                                                <PencilIcon width={16} height={16} />
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </View>

                            <View style={[styles.nutritionBox, styles.carbsBox]}>
                                <Text style={styles.nutritionLabel}>Carbs</Text>
                                <View style={styles.nutritionValueContainer}>
                                    {editNutrition === 'carbs' ? (
                                        <View style={styles.editNutritionContainer}>
                                            <TextInput
                                                style={styles.editNutritionInput}
                                                value={tempNutrition}
                                                onChangeText={setTempNutrition}
                                                autoFocus
                                            />
                                            <TouchableOpacity onPress={() => saveNutrition('carbs')}>
                                                <Text style={styles.saveButton}>Save</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <>
                                            <Text style={styles.nutritionValue}>{carbs}</Text>
                                            <TouchableOpacity onPress={() => handleEditNutrition('carbs', carbs)}>
                                                <PencilIcon width={16} height={16} />
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Active Restrictions (horizontal scrollable) */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.activeRestrictionsContainer}
                    >
                        {activeRestrictions.map((restriction) => (
                            <TouchableOpacity
                                key={restriction.id}
                                style={styles.restrictionBadge}
                                onPress={() => toggleRestriction(restriction.id)}
                            >
                                <Text style={styles.restrictionText}>{restriction.name}</Text>
                                <Text style={styles.removeIcon}>−</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Apply Dietary Restrictions Card */}
                <View style={styles.applyRestrictionsCard}>
                    <Text style={styles.cardTitle}>Apply dietary restrictions</Text>

                    <View style={styles.restrictionsGrid}>
                        {availableRestrictions.map((restriction) => (
                            <TouchableOpacity
                                key={restriction.id}
                                style={styles.addRestrictionButton}
                                onPress={() => addRestriction(restriction.id)}
                            >
                                <Text style={styles.addRestrictionText}>{restriction.name}</Text>
                                <PlusIcon width={16} height={16} color={'blue'} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 36,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: "Inter-SemiBold",
        letterSpacing: 0.5,
    },
    settingsButton: {
        padding: 8,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        zIndex: 100,
    },
    settingsMenu: {
        position: "absolute",
        top: 65,
        right: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingVertical: 10,
        width: 170,
        elevation: 4,
    },
    iOSShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    settingsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#B6B6B6",
    },
    settingsTitle: {
        fontSize: 16,
        fontFamily: "Inter-SemiBold",
    },
    settingsItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    settingsItemText: {
        fontSize: 14,
        fontFamily: "Inter-Regular",
    },
    deleteProfileText: {
        fontSize: 14,
        fontFamily: "Inter-Regular",
        color: "red",
    },
    profileCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginTop: 4,
        borderWidth: 1,
        borderColor: "#B6B6B6",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    profileSection: {
        flexDirection: "row",
    },
    profileImageContainer: {
        marginRight: 16,
        paddingTop: 8,
    },
    profileImage: {
        width: 91,
        height: 95,
        borderRadius: 15,
        backgroundColor: "#EEF5FC",
        justifyContent: "center",
        alignItems: "center",
    },
    profileInfo: {
        flex: 1,
    },
    infoRow: {
        flexDirection: "row",
        paddingVertical: 8,
    },
    infoLabel: {
        width: 50,
        fontSize: 14,
        color: "#65829C",
        fontFamily: "Inter-Regular",
    },
    valueContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#f0f5fa",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    infoValue: {
        fontSize: 12,
        color: "#000",
        opacity: 0.5,
        fontFamily: "Inter-Regular",
    },
    editContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    editInput: {
        flex: 1,
        fontSize: 14,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginRight: 8,
        backgroundColor: "#fff",
    },
    saveButton: {
        color: "#FFF",
        opacity: 0.7,
        fontFamily: "Inter-SemiBold",
        fontSize: 14,
    },
    dietaryCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: "#B6B6B6",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    cardTitle: {
        fontSize: 20,
        fontFamily: "Inter-SemiBold",
        color: "#205446",
        marginBottom: 16,
    },
    nutritionGrid: {
        marginBottom: 16,
    },
    nutritionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    nutritionBox: {
        width: "48%",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    fatBox: {
        backgroundColor: "#76B8EC",
    },
    caloriesBox: {
        backgroundColor: "#B18963",
    },
    proteinBox: {
        backgroundColor: "#DDA16A",
    },
    carbsBox: {
        backgroundColor: "#81B58F",
    },
    nutritionLabel: {
        fontSize: 25,
        fontFamily: "Inter-SemiBold",
        color: "#fff",
        textAlign: "center",
    },
    nutritionValueContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 4,
    },
    nutritionValue: {
        fontSize: 18,
        color: "#fff",
        opacity: 0.7,
        fontFamily: "Inter-SemiBold",
        marginRight: 6,
    },
    editNutritionContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    editNutritionInput: {
        width: 60,
        fontSize: 16,
        borderRadius:5,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginRight: 8,
        backgroundColor: "#fff",
    },
    activeRestrictionsContainer: {
        flexDirection: "row",
        marginTop: 8,
    },
    restrictionBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EEF5FC",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: "#ABC9E2",
    },
    restrictionText: {
        fontSize: 14,
        fontFamily: "Inter-Regular",
        color: "#226196",
        marginRight: 6,
    },
    removeIcon: {
        fontSize: 16,
        color: "#226196",
    },
    applyRestrictionsCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: "#B6B6B6",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    restrictionsGrid: {
        flexDirection: "column",
    },
    addRestrictionButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#EEF5FC",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 30,
        marginBottom: 12,
        borderWidth: 3,
        borderColor: "#B8D1E6",
    },
    addRestrictionText: {
        fontSize: 25,
        fontFamily: "Inter-SemiBold",
        textAlign: "center",
        color: "#547DA0",
    },
    plusIcon: {
        color: "#205446",
    },
})