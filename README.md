# Món quà dành cho Thanh Thương cute

Mở `index.html` trực tiếp, hoặc chạy trong thư mục này:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Truy cập http://127.0.0.1:4173/.

Luồng: chờ mở quà → chạm bó hồng → bó ảnh → chạm lần nữa → không gian lời chúc và ảnh → mở lá thư.

Tên và lời chúc nằm trong `config.js`. Tham số `?to=Lan` cũ không thay đổi tên người nhận nữa.

Khi có ảnh, đặt chúng trong thư mục `images`, rồi điền vào `photos` trong `config.js`, ví dụ:

```js
photos: ['images/thuong-01.jpg', 'images/thuong-02.jpg']
```

Ảnh tự xuất hiện trong bó hoa, không gian lời chúc và lá thư. Khi chưa có ảnh, các vị trí này hiển thị trái tim.

Nhạc là file `Ngay-Hanh-Phuc-Bang-Cuong.mp3`, tự phát từ giây 10 khi trình duyệt cho phép. Nếu trình duyệt yêu cầu tương tác, nhạc bắt đầu ở lần chạm đầu tiên. Nút ♫ tắt/bật nhạc; sau khi tắt, các thao tác khác không tự bật lại nhạc. Khi hết bài, nhạc lặp lại từ giây 10. Khi đưa lên Vercel, giữ file MP3 này cùng các file website. Kéo trên màn hình lời chúc để xoay; cuộn chuột để phóng to/thu nhỏ. Nút ↻ bắt đầu lại phần hình ảnh.

Hoa hiện tại được vẽ bằng SVG; chưa dùng hình bó hoa chụp như trong video tham chiếu. Chữ sử dụng Google Fonts, có phông dự phòng khi ngoại tuyến.
