// 전역 변수 선언
var map;
var allMarkers = [];
var cafeMarkers = [];
var koreanFoodMarkers = [];
var westernFoodMarkers = [];
var chineseFoodMarkers = [];
var japaneseFoodMarkers = [];

// 초기화 함수
fetch('/restaurants')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(restaurants => {
        initializeMap();
        placeMarkers(restaurants);
        displayResults(restaurants); // 데이터를 받아온 후에 결과 표시
    })
    .catch(error => console.error('Error fetching restaurants:', error));

// 지도 초기화 함수
function initializeMap() {
    var mapContainer = document.getElementById('map');
    var mapOption = {
        center: new kakao.maps.LatLng(35.1798, 129.0750),
        level: 3
    };
    map = new kakao.maps.Map(mapContainer, mapOption);
}

// 마커 생성 함수
function placeMarkers(restaurants) {
    for (var i = 0; i < restaurants.length; i++) {
        var restaurant = restaurants[i];
        var marker = createMarker(restaurant);
        allMarkers.push(marker);

        // 카테고리별로 마커 배열에 추가
        switch (restaurant.category) {
            case '카페':
                cafeMarkers.push(marker);
                break;
            case '한식':
                koreanFoodMarkers.push(marker);
                break;
            case '양식':
                westernFoodMarkers.push(marker);
                break;
            case '중식':
                chineseFoodMarkers.push(marker);
                break;
            case '일식':
                japaneseFoodMarkers.push(marker);
                break;
            default:
                break;
        }
    }
}

// 마커 생성 및 인포윈도우 이벤트 설정 함수
function createMarker(restaurant) {
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(restaurant.latitude, restaurant.longitude),
        title: restaurant.name,
        category: restaurant.category
    });

    var infowindow = new kakao.maps.InfoWindow({
        content: getInfowindowContent(restaurant)
    });

    // 마커 클릭 시 인포윈도우 열고 닫기
    kakao.maps.event.addListener(marker, 'click', function () {
        if (infowindow.getMap()) {
            infowindow.close();
        } else {
            infowindow.open(map, marker);
        }
    });

    return marker;
}

// 인포윈도우 내용 생성 함수
function getInfowindowContent(restaurant) {
    var content = '<div style="padding:10px;">';
    content += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + restaurant.name + '</div>';
    content += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + restaurant.address + '</div>';
    content += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + restaurant.hours + '</div>';
    content += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + restaurant.category + '</div>';
    content += '</div>';
    return content;
}

// 현재 선택된 카테고리 저장 변수
var currentCategory = null;

// 카테고리별 마커 표시 함수
function showMarkersByCategory(category) {
    // 클릭한 카테고리가 현재 선택된 카테고리와 같은지 확인
    if (currentCategory === category) {
        // 같으면 모든 마커를 표시하고 현재 카테고리를 초기화
        showMarkers(allMarkers);
        displayResults(allMarkers);
        currentCategory = null;
    } else {
        // 다르면 모든 마커를 숨기고 선택한 카테고리의 마커를 표시하고 현재 카테고리를 업데이트
        hideMarkers(allMarkers);
        showMarkers(getMarkersByCategory(category));
        displayResults(getMarkersByCategory(category));
        currentCategory = category;
    }
}

// 카테고리에 해당하는 마커 배열 반환 함수
function getMarkersByCategory(category) {
    switch (category) {
        case 'cafeMarkers':
            return cafeMarkers;
        case 'koreanFoodMarkers':
            return koreanFoodMarkers;
        case 'westernFoodMarkers':
            return westernFoodMarkers;
        case 'chineseFoodMarkers':
            return chineseFoodMarkers;
        case 'japaneseFoodMarkers':
            return japaneseFoodMarkers;
        default:
            return [];
    }
}

// 모든 마커 숨기기 함수
function hideAllMarkers() {
    hideMarkers(allMarkers);
}

// 마커 표시 함수
function showMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// 마커 숨기기 함수
function hideMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

// 마커 클릭 시 음식점 정보와 리뷰 표시 함수
function handleMarkerClick(restaurant) {
    displayInfoAndReviews(restaurant);
}

// 검색 결과 표시 함수
function displayResults(results) {
    var resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = ''; // 결과 컨테이너 초기화

    // 검색 결과가 없을 경우 메시지 출력
    if (results.length === 0) {
        resultsContainer.innerHTML = '해당 카테고리의 음식점이 없습니다.';
        return;
    }

    // 검색 결과를 나열하여 결과 컨테이너에 추가
    for (var i = 0; i < results.length; i++) {
        var restaurant = results[i];
        var infowindowContent = getInfowindowContent(restaurant);

        // 새로운 div 요소를 생성하여 마커 정보 추가
        var restaurantDiv = document.createElement('div');
        restaurantDiv.innerHTML = infowindowContent;

        // 결과 컨테이너에 새로운 div 요소 추가
        resultsContainer.appendChild(restaurantDiv);

        // 마커 클릭 시 음식점 정보와 리뷰 표시
        (function (restaurant) {
            restaurantDiv.addEventListener('click', function () {
                handleMarkerClick(restaurant);
            });
        })(restaurant);
    }
}

// 검색 버튼 클릭 시 이벤트 핸들러
var searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', function () {
    searchRestaurants();
});

// 검색 함수
function searchRestaurants() {
    var searchTerm = document.getElementById('search-input').value.toLowerCase();
    var results = findRestaurantsBySearchTerm(searchTerm);
    showMarkers(results); // 검색어에 맞는 마커만 지도에 표시
    displayResults(results); // 검색 결과를 검색 결과 컨테이너에 업데이트
}

// 검색어에 맞는 음식점 찾기 함수
function findRestaurantsBySearchTerm(searchTerm) {
    var results = [];

    // 전체 음식점 중 검색어가 포함된 음식점 필터링
    for (var i = 0; i < allMarkers.length; i++) {
        var restaurant = allMarkers[i];
        var name = (restaurant.title || '').toLowerCase();

        if (name.includes(searchTerm)) {
            results.push(restaurant);
        }
    }

    return results;
}

// 검색어 입력 시 이벤트 핸들러
var searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', function () {
    var searchTerm = searchInput.value.toLowerCase();
    var results = findRestaurantsBySearchTerm(searchTerm);
    displayResults(results);
});


// 마커 클릭 시 음식점 정보와 리뷰 표시 함수
function handleMarkerClick(restaurant) {
    displayInfoAndReviews(restaurant);
}

// 검색 결과 및 리뷰 게시판 초기화 함수
function clearInfoAndReviews() {
    var infoContainer = document.getElementById('results-container');
    var reviewsContainer = document.getElementById('reviews-container');
    infoContainer.innerHTML = '';
    reviewsContainer.innerHTML = '';
}

// 리뷰 작성 폼 표시 함수
function showReviewForm() {
    // 리뷰 폼 보이기
    var reviewForm = document.getElementById('review-form');
    reviewForm.style.display = 'block';

    // 리뷰 컨테이너 닫기
    toggleReviewContainer(true);
}
// 리뷰 보기 버튼 클릭 시 이벤트 핸들러
var showReviewButton = document.getElementById('show-review-button');
showReviewButton.addEventListener('click', function () {
    toggleReviewContainer(); // 리뷰 컨테이너 토글
});

// 리뷰 창 토글 함수
function toggleReviewContainer(forceClose = false) {
    var reviewContainer = document.getElementById('review-container');

    if (!reviewContainer) {
        console.error('Review container not found');
        return;
    }

    if (forceClose || reviewContainer.style.display === 'block') {
        reviewContainer.style.display = 'none';
    } else {
        reviewContainer.style.display = 'block';
    }
}

// 리뷰 작성 함수
function submitReview() {
    var username = document.getElementById('username').value;
    var comment = document.getElementById('comment').value;
    var rating = document.getElementById('rating').value;

    // TODO: 실제로 서버로 리뷰를 전송하고 저장하는 코드를 작성해야 합니다.
    // 서버로 리뷰를 전송하는 부분은 앞서 서버 사이드의 코드에서 '/submit-review' 또는 유사한 엔드포인트를 만들어 처리해야 합니다.
    // 아래는 예시로 console에 리뷰 정보를 출력하는 코드입니다.
    console.log('Review submitted:', { username, comment, rating });

    // TODO: 실제로 서버로부터 업데이트된 리뷰 목록을 받아와서 화면에 표시하는 코드를 추가해야 합니다.

    // 더미 리뷰를 예시로 추가하는 코드
    var reviewDiv = document.createElement('div');
    var usernameNode = document.createElement('p');
    usernameNode.appendChild(document.createTextNode(username));
    var commentNode = document.createElement('p');
    commentNode.appendChild(document.createTextNode(comment));
    var ratingNode = document.createElement('p');
    ratingNode.appendChild(document.createTextNode('평점: ' + rating));
    var hrNode = document.createElement('hr');

    reviewDiv.appendChild(usernameNode);
    reviewDiv.appendChild(commentNode);
    reviewDiv.appendChild(ratingNode);
    reviewDiv.appendChild(hrNode);

    var reviewsContainer = document.getElementById('reviews-container');

    // Reviews container를 찾지 못한 경우 예외처리
    if (!reviewsContainer) {
        console.error('Reviews container not found');
        return;
    }
    reviewsContainer.appendChild(reviewDiv);

    // 리뷰 작성 후 창 닫기
    toggleReviewContainer(true);

    // 리뷰 작성 후 폼 숨기기
    var reviewForm = document.getElementById('review-form');
    reviewForm.style.display = 'none';
}



// 검색 결과 및 리뷰 게시판 표시 함수
function displayInfoAndReviews(restaurant) {
    var infoContainer = document.getElementById('results-container');
    var reviewsContainer = document.getElementById('reviews-container');

    // 음식점 정보 표시
    infoContainer.innerHTML = `
        <h3>${restaurant.name}</h3>
        <p>카테고리: ${restaurant.category}</p>
        <p>주소: ${restaurant.address}</p>
        <p>전화번호: ${restaurant.phone}</p>
        <p>영업시간: ${restaurant.hours}</p>
    `;

    // 리뷰 작성 폼 표시 버튼
    var reviewButton = document.createElement('button');
    reviewButton.innerText = '리뷰 작성';
    reviewButton.addEventListener('click', function () {
        showReviewForm();
    });

    infoContainer.appendChild(reviewButton);

    // TODO: 서버에서 리뷰 데이터를 받아와서 동적으로 리뷰 게시판에 추가하는 코드를 작성해야 합니다.
    // 더미 리뷰를 예시로 추가하는 코드를 넣었습니다. 실제로는 서버에서 리뷰 데이터를 받아와서 사용해야 합니다.
    var dummyReviews = [
        { user: 'User1', comment: '맛있어요!', rating: 5 },
        { user: 'User2', comment: '좋아요!', rating: 4 },
        // 추가적인 더미 리뷰...
    ];

    // TODO: 서버에서 받아온 리뷰 데이터를 사용하여 동적으로 리뷰 게시판에 추가하는 코드를 작성하세요.
    // 더미 리뷰를 리뷰 게시판에 추가
    dummyReviews.forEach(review => {
        var reviewDiv = document.createElement('div');
        reviewDiv.innerHTML = `
            <p>${review.user}</p>
            <p>${review.comment}</p>
            <p>평점: ${review.rating}</p>
            <hr>
        `;
        reviewsContainer.appendChild(reviewDiv);
    });
}
