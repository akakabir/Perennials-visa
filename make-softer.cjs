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
    content = content.replace(/bg-white/g, 'bg-[#FCFBF8]');
    content = content.replace(/bg-\[\#F8F9FA\]/g, 'bg-[#F7F5F0]');
    content = content.replace(/bg-\[\#F3F4F6\]/g, 'bg-[#F0EEE9]');
    content = content.replace(/bg-\[\#F9F9F8\]/g, 'bg-[#FAF8F4]');
    
    // Text
    content = content.replace(/text-gray-900/g, 'text-[#3E3A35]');
    content = content.replace(/text-gray-700/g, 'text-[#5C564D]');
    content = content.replace(/text-gray-600/g, 'text-[#7A7369]');
    
    // Borders
    content = content.replace(/border-\[\#CACACB\]\/40/g, 'border-[#E6DFD5]');
    content = content.replace(/border-\[\#CACACB\]\/60/g, 'border-[#D9CFBE]');
    content = content.replace(/border-\[\#CACACB\]\/20/g, 'border-[#F0EBE1]');
    
    // Some specific tailwind gray hover states
    content = content.replace(/hover:text-gray-700/g, 'hover:text-[#5C564D]');
    content = content.replace(/hover:text-gray-900/g, 'hover:text-[#3E3A35]');
    content = content.replace(/hover:bg-gray-100/g, 'hover:bg-[#F0EEE9]');
    content = content.replace(/bg-gray-50/g, 'bg-[#F7F5F0]');
    
    fs.writeFileSync(file, content);
});
console.log('Theme softened.');
