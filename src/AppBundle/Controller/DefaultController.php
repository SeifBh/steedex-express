<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DefaultController extends Controller
{

    public function nbUsersAction()
    {
        $em=$this->getDoctrine()->getManager();
        $nb_users = $em->getRepository("UserBundle:User")->countAllUsers();
        return new Response($nb_users);
    }


    public function countUnreadMessagesAction()
    {
        $em=$this->getDoctrine()->getManager();
        $nb_unread_msgs = $em->getRepository("DemandeBundle:Demande")->countUnreadCol();
        return new Response($nb_unread_msgs);
    }

}
