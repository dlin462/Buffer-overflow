export default function Welcome({setPage}) {
    const continueGuest = () => {
        setPage('Content');
    }
    const signUp = () => {
        setPage('SignUp');
    }
    const logIn = () => {
        setPage('Login');
    }

    return (
        <>
            <div className="welcome-sign">Welcome to Fake Stack OverFlow!</div>
            <div className="Welcome">
                <button className="login-button" onClick={logIn}>Login</button>
                <button className="signup-button" onClick={signUp}>Sign Up</button>
                <button className= "guest-button" onClick= {continueGuest}>Continue As Guest</button>
            </div>
            
        </>
        
    );
    
}