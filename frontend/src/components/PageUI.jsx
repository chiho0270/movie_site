import React from "react";
import '../styles/PageUI.css';

function Page() {
    return (
        <div class="footer">
            <a class="page-navi prev disabled" href="#">이전</a>
            <div class="page-links">
                <a class="page-link" href="#">1</a>
            </div>
            <a class="page-navi next" href="#">다음</a>
        </div>
    );
}

export default Page;
