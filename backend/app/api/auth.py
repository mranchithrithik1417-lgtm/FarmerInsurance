from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.models.models import User, FarmerProfile, OfficerProfile, AuditLog
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive or not found")
    return user


@router.post("/register", response_model=TokenResponse)
def register(req: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    hashed = get_password_hash(req.password)
    user = User(
        email=req.email.lower(),
        hashed_password=hashed,
        full_name=req.full_name,
        phone=req.phone,
        role=req.role.lower()
    )
    db.add(user)
    db.flush()

    if user.role == "farmer":
        profile = FarmerProfile(
            user_id=user.id,
            state=req.state or "Karnataka",
            district=req.district or "Mandya",
            taluk=req.taluk or "Maddur",
            village=req.village or "Kestur"
        )
        db.add(profile)
    elif user.role == "officer":
        profile = OfficerProfile(
            user_id=user.id,
            department=req.department or "Department of Agriculture",
            designation=req.designation or "Agricultural Officer",
            jurisdiction_district=req.district or "Mandya"
        )
        db.add(profile)

    audit = AuditLog(
        user_id=user.id,
        action="USER_REGISTER",
        entity_type="USER",
        entity_id=str(user.id),
        details=f"User registered with role {user.role}"
    )
    db.add(audit)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "phone": user.phone
        }
    }


@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is suspended")

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    
    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        entity_type="USER",
        entity_id=str(user.id),
        details=f"Successful login for {user.email}"
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "phone": user.phone
        }
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    extra = {}
    if current_user.role == "farmer" and current_user.farmer_profile:
        extra = {
            "state": current_user.farmer_profile.state,
            "district": current_user.farmer_profile.district,
            "taluk": current_user.farmer_profile.taluk,
            "village": current_user.farmer_profile.village
        }
    elif current_user.role == "officer" and current_user.officer_profile:
        extra = {
            "department": current_user.officer_profile.department,
            "designation": current_user.officer_profile.designation,
            "jurisdiction_district": current_user.officer_profile.jurisdiction_district
        }

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "profile": extra
    }
