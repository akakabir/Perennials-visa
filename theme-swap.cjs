const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Backgrounds
    content = content.replace(/bg-\[\#0A0A31\]/g, 'bg-white');
    content = content.replace(/bg-\[\#000000\]/g, 'bg-white');
    content = content.replace(/bg-\[\#080C22\]/g, 'bg-[#F8F9FA]');
    content = content.replace(/bg-\[\#0C1230\]/g, 'bg-[#F3F4F6]');
    
    // Text
    content = content.replace(/text-white/g, 'text-gray-900');
    content = content.replace(/text-\[\#E9EDF5\]/g, 'text-gray-900');
    content = content.replace(/text-\[\#CACACB\]/g, 'text-gray-600');
    content = content.replace(/text-\[\#8C8D8D\]/g, 'text-gray-700');
    
    // Borders
    content = content.replace(/border-\[\#CACACB\]\/10/g, 'border-[#CACACB]/40');
    content = content.replace(/border-\[\#CACACB\]\/20/g, 'border-[#CACACB]/60');
    
    fs.writeFileSync(file, content);
});
console.log('Theme replaced.');
