import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './lib/firebase';

export async function checkAndUpdateTemplates() {
  const snapshot = await getDocs(collection(db, 'emailTemplates'));
  snapshot.forEach(async (d) => {
    const data = d.data();
    if (data.name === 'Assessment - Not Recommended to Proceed') {
      let body = data.body;
      if (body.includes('allowing us to review') || body.includes('{{companyName}}')) {
        body = body.replace('allowing us to review', 'allowing Perennials to review');
        body = body.replace(/{{companyName}}/g, 'Perennials');
        await updateDoc(doc(db, 'emailTemplates', d.id), { body });
      }
    }
    if (data.name === 'Assessment - You Can Proceed') {
      let body = data.body;
      if (body.includes('{{companyName}}')) {
        body = body.replace(/{{companyName}}/g, 'Perennials');
        await updateDoc(doc(db, 'emailTemplates', d.id), { body });
      }
    }
  });
}
