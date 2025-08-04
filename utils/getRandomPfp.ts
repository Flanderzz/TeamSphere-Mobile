import AsyncStorage from "@react-native-async-storage/async-storage"

// TODO: make this take in the UserID since I want multi-user devices
export const getRandomPfp = async (): Promise<string> => {
    try {
        let profilePhoto: string | null = await AsyncStorage.getItem("PfpNumber") as string;

        if (profilePhoto != null) {
            console.log(profilePhoto);
            return profilePhoto;
        }
        const random = Math.floor(Math.random() * 4) + 1;
        profilePhoto = getPfpLink(random);

        await AsyncStorage.setItem("PfpNumber", profilePhoto);

        console.log(profilePhoto);
        return profilePhoto;
    } catch (error: any) {
        console.error("Error in getRandomPfp:", error);
        return "https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/5a8dc8ac-c9da-4810-f69c-d414078e7600/public";
    }
}

const getPfpLink = (pfpNumber: number): string => {
    switch (pfpNumber) {
        case 1:
            return 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/b528855d-7695-455c-d739-1680bf6f7b00/public';
        case 2:
            return 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/7e7f25b5-da52-4640-cf3a-a7d7af511b00/public';
        case 3:
            return 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/c0215b53-7d87-4f60-20fe-55376edc0800/public';
        case 4:
            return 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/9e96c7dc-9487-4cb0-317d-3f7dd3017f00/public';
        default:
            // something must have went really wrong to get the ippo pfp
            return 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/5a8dc8ac-c9da-4810-f69c-d414078e7600/public';
    }
}