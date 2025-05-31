import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import '../App.css';

const BannerSlider = ({images}) => {
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
    };
    
    return (
        <div className="banner-slider" style={{ marginBottom: '2rem' }}>
            <Slider {...settings}>
            {images.map((img, i) => (
                <div key={i}>
                <img
                    src={img}
                    alt={`banner-${i}`}
                    style={{
                        width: '100%',
                        height: '700px',
                        objectFit: 'contain',
                        borderRadius: '10px',
                        
                    }}
                />
                </div>
            ))}
            </Slider>
        </div>
    );
};

// 슬라이더 안쪽 좌우 화살표 버튼 컴포넌트
const CustomNextArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      style={{
        position: 'absolute',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        width: '60px',
        height: '60px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      <span style={{ color: 'white', fontSize: '24px' }}>{'>'}</span>
    </div>
  );
};

const CustomPrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      style={{
        position: 'absolute',
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        width: '60px',
        height: '60px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      <span style={{ color: 'white', fontSize: '24px' }}>{'<'}</span>
    </div>
  );
};


export default BannerSlider;