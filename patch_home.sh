sed -i 's/const { siteSettings, visaPlans, reviews, processSteps, addReview } = useAppContext();/const { siteSettings, visaPlans, reviews, processSteps, addReview, addApplication } = useAppContext();/g' src/pages/Home.tsx
sed -i 's/const { addApplication } = useAppContext();//g' src/pages/Home.tsx
