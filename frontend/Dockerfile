# Gunakan image Node.js 20
FROM node:20

# Set working directory di dalam container
WORKDIR /app

# Salin package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin seluruh isi folder frontend ke dalam container
COPY . .

# Expose port yang digunakan frontend
EXPOSE 3000

# Jalankan aplikasi dalam mode development
# Menambahkan -- -H 0.0.0.0 agar bisa diakses dari luar container (Docker networking)
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
