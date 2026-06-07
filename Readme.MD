# 🔥 Workout Shuffle

Workout Shuffle is a dynamic, interactive weekly schedule planner designed to help you track physical activity and estimate the **Net Active Calories** you need to consume to fuel your sessions. Whether you are lifting weights, hiking, or bicycling, this app provides a real-time summary of your supplemental nutritional needs.

## 🚀 Features

* **Dynamic Weekly Scheduling:** Easily reorder your workout days using a smooth drag-and-drop interface.
* **Net Active Calorie Calculation:** Estimates only the *additional* calories burned above your resting metabolic rate (BMR), helping you align your food intake with your activity.
    * **Lifting:** Duration-based (minutes) with variable intensity MET values.
    * **Hiking & Bicycling:** Distance-based (miles) with speed-dependent pace mapping.
    * **Body Weight:** Precise scaling based on your weight input.
* **Weekly Active Totals:** Live updates of the cumulative extra calories required for your week's training.
* **Nutrition & Fueling Guide:** Detailed instructions on pre-load and post-load fueling strategies based on the specific burn of each workout.
* **Mobile-First Design:** Optimized for Android devices with full-width cards, a toggleable stats sidebar, and a clean, accessible layout.
* **Theme Support:** Dark and Light modes with high-contrast UI elements for maximum readability in all conditions.

## 📱 Android App

This project is built as a native Android application using **Capacitor**.
* **Signed Builds:** Automatically configured with release signing for production deployment.
* **Automated CI/CD:** GitHub Actions are set up to compile and sign APKs on every version tag (`v*`).

See [ANDROID_RELEASE_SETUP.md](./ANDROID_RELEASE_SETUP.md) for instructions on setting up automated signing.

## 💻 Tech Stack

* **Framework:** [React](https://reactjs.org/)
* **Native Bridge:** [Capacitor](https://capacitorjs.com/)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Build Tool:** [Vite](https://vitejs.dev/)

## 📖 How to Use

1.  **Set Your Weight:** Enter your current weight in the sidebar to ensure calorie accuracy.
2.  **Organize Your Week:** Drag the chevron handles on each card to move workouts to different days.
3.  **Log Activity:** 
    * Input **minutes** for Lifting.
    * Input **miles** for Hiking and Bicycling (the app calculates duration based on your selected intensity).
4.  **Check Nutrition:** Switch to the "Nutrition & Instructions" tab to see specialized fueling guides for your scheduled activities.
5.  **Track Totals:** Use the "Weekly Total" in the sidebar to see exactly how many extra calories you need for the week.

---
*Created as a high-performance fitness utility with a focus on active calorie management.*
