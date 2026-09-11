import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";

export default function AddWalletPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch student data
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/student/profile/${studentId}`
        );
        if (res.ok) {
          const data = await res.json();
          setStudent(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudent();
  }, [studentId]);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/wallet/add/${studentId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Number(amount) }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        // Update student wallet balance
        setStudent((prev) => ({
          ...prev,
          walletBalance: data.walletBalance,
        }));

        setMessage(
          `💰 ₹${amount} added successfully! New wallet balance: ₹${data.walletBalance}. Redirecting to dashboard...`
        );
        setAmount("");

        // Redirect after 5 seconds
        setTimeout(() => {
          navigate(`/${studentId}/student-dashboard`);
        }, 5000);
      } else {
        setMessage(data.message || "Failed to add money");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!student)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading student info...</p>
      </div>
    );

  return (
    <Container className="mt-5" style={{ maxWidth: "500px" }}>
      <h3 className="text-center mb-4">💳 Add Money to Wallet</h3>
      <p className="text-center">Student: {student.name}</p>
      <p className="text-center">
        Current Wallet Balance: ₹{student.walletBalance}
      </p>

      {message && <Alert variant="info">{message}</Alert>}

      <Form onSubmit={handleAddMoney}>
        <Form.Group className="mb-3" controlId="amount">
          <Form.Label>Enter Amount</Form.Label>
          <Form.Control
            type="number"
            min="1"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" className="w-100" disabled={loading}>
          {loading ? "Adding..." : "Add Money"}
        </Button>
      </Form>

      <p className="text-center mt-3 text-muted">
        You will be redirected to your dashboard automatically after 5 seconds.
      </p>
    </Container>
  );
}
