import React from "react";
import '../styles/PageUI.css';

function Page() {
    return (
        <div className="footer">
            <button className="page-navi prev disabled" type="button" disabled>이전</button>
            <div className="page-links">
                <button className="page-link" type="button">1</button>
            </div>
            <button className="page-navi next" type="button">다음</button>
        </div>
    );
}

export default Page;
