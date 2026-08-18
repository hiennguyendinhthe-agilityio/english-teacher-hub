import requests
import json

BASE_URL = "https://jsonplaceholder.typicode.com/posts"

def test_get():
    print("\n--- 1. Thực hiện GET Request (Lấy bài viết số 1) ---")
    response = requests.get(f"{BASE_URL}/1")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Dữ liệu nhận được:")
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print("Lấy dữ liệu thất bại.")

def test_post():
    print("\n--- 2. Thực hiện POST Request (Tạo bài viết mới) ---")
    new_post = {
        "title": "Học Python cùng cô Vân",
        "body": "API là một phần cực kỳ quan trọng trong lập trình backend và tích hợp hệ thống.",
        "userId": 1
    }
    response = requests.post(BASE_URL, json=new_post)
    print(f"Status Code: {response.status_code} (201 có nghĩa là đã tạo thành công)")
    if response.status_code == 201:
        print("Dữ liệu phản hồi:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))

def test_put():
    print("\n--- 3. Thực hiện PUT Request (Cập nhật bài viết số 1) ---")
    updated_post = {
        "id": 1,
        "title": "Học API nâng cao",
        "body": "Nội dung bài viết mới sau khi dùng phương thức PUT.",
        "userId": 1
    }
    response = requests.put(f"{BASE_URL}/1", json=updated_post)
    print(f"Status Code: {response.status_code} (200 là thành công)")
    if response.status_code == 200:
        print("Dữ liệu sau cập nhật:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))

def test_delete():
    print("\n--- 4. Thực hiện DELETE Request (Xóa bài viết số 1) ---")
    response = requests.delete(f"{BASE_URL}/1")
    print(f"Status Code: {response.status_code} (200 hoặc 204 nghĩa là xóa thành công)")

if __name__ == "__main__":
    print("Bắt đầu chạy thử nghiệm gọi API với Python:")
    try:
        test_get()
        test_post()
        test_put()
        test_delete()
        print("\nChúc mừng! Bạn đã chạy thành công toàn bộ demo gọi API RESTful bằng Python!")
    except Exception as e:
        print(f"\nĐã xảy ra lỗi khi chạy thử nghiệm: {e}")
        print("Hãy chắc chắn rằng bạn đang sử dụng môi trường ảo đã cài 'requests'.")
