# Gunakan image Python 3.10
FROM python:3.10

# Set working directory di dalam container
WORKDIR /app

# Salin file requirements.txt terlebih dahulu untuk memanfaatkan layer caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh isi folder backend ke dalam folder /app/backend
COPY . ./backend/

# Expose port yang digunakan backend
EXPOSE 8000

# Jalankan menggunakan uvicorn sebagai package
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
